import asyncio
import logging
from datetime import datetime

import httpx

from auth import token_manager, API_URL
from browser_scraper import check_case_browser
from models import Case, CaseStatusHistory, ScrapeRun

logger = logging.getLogger(__name__)

_NIW_KEYWORDS  = ["national interest waiver", "niw", "eb-22", "eb22"]
_EB1A_KEYWORDS = ["extraordinary ability", "eb-1a", "eb1a", "alien of extraordinary"]

CONCURRENCY          = 1
REQUEST_DELAY        = 1.2    # seconds between requests → ~0.8 req/s
EARLY_STOP_THRESHOLD = 2_000  # consecutive 404s before skipping rest of block
BATCH_SIZE           = CONCURRENCY * 5

# Targeted scan plan derived from trackmyi140.com block data.
# Receipt format: {center}{year_str}{block:0{bd}d}{seq:0{sd}d} = 13 chars total
# seq_digits = 13 - 3 - len(year_str) - block_digits
#
# Entry: (center, year_str, block_range, block_digits, seq_limit)
SCAN_PLAN = [
    # LIN 2023: 3+2+4+4=13  — known blocks 9020–9027, scan wider window
    ("LIN", "23", range(9010, 9035), 4, 10_000),
    # LIN 2024: blocks 9000–9008 seen, scan wider
    ("LIN", "24", range(8990, 9020), 4, 10_000),
    # LIN 2025: extrapolate forward
    ("LIN", "25", range(8980, 9010), 4, 10_000),
    # SRC 2023: blocks 9009–9012 seen
    ("SRC", "23", range(9000, 9020), 4, 10_000),
    # SRC 2024/2025
    ("SRC", "24", range(8990, 9015), 4, 10_000),
    ("SRC", "25", range(8980, 9010), 4, 10_000),
    # IOE year 09 (old transferred cases): 3+2+3+5=13 — blocks 228–357
    ("IOE", "09", range(220, 360), 3, 10_000),
    # IOE newer years (if any)
    ("IOE", "23", range(200, 350), 3, 10_000),
    ("IOE", "24", range(1,   200), 3, 10_000),
    ("IOE", "25", range(1,   100), 3, 10_000),
]


def is_niw_case(form_type: str, desc: str) -> bool:
    """Return True if the case is an I-140 National Interest Waiver."""
    combined = (form_type + " " + desc).lower()
    return any(kw in combined for kw in _NIW_KEYWORDS)


def get_case_category(form_type: str, desc: str) -> str:
    combined = (form_type + " " + desc).lower()
    if any(kw in combined for kw in _NIW_KEYWORDS):
        return "NIW"
    return "EB-1A"


def is_tracked_case(form_type: str, desc: str) -> bool:
    """Return True if the case is NIW or EB-1A (both tracked)."""
    combined = (form_type + " " + desc).lower()
    return any(kw in combined for kw in _NIW_KEYWORDS) or \
           any(kw in combined for kw in _EB1A_KEYWORDS)


def build_receipts_for_plan_entry(center: str, year_str: str, block: int,
                                   block_digits: int, seq_limit: int):
    seq_digits = 13 - 3 - len(year_str) - block_digits
    base = f"{center}{year_str}{block:0{block_digits}d}"
    for seq in range(seq_limit):
        yield f"{base}{seq:0{seq_digits}d}"


class CaseScraper:
    def __init__(self, db):
        self.db = db

    # ------------------------------------------------------------------
    # API path (primary)
    # ------------------------------------------------------------------

    async def check_case_api(
        self, client: httpx.AsyncClient, receipt: str, token: str
    ) -> tuple[dict | None, str]:
        """
        Returns (result_dict_or_None, outcome).
        outcome: "found" | "not_found" | "blocked" | "skipped"
        """
        try:
            resp = await client.get(
                API_URL.format(receipt=receipt),
                headers={"Authorization": f"Bearer {token}"},
                timeout=15,
            )

            if resp.status_code == 404:
                return None, "not_found"

            if resp.status_code == 429:
                retry_after = int(resp.headers.get("Retry-After", 60))
                logger.warning("Rate limited — backing off %ds", retry_after)
                await asyncio.sleep(retry_after)
                return None, "not_found"  # skip, don't trigger browser fallback

            if resp.status_code == 503:
                return None, "blocked"   # signal caller to try browser path

            if resp.status_code != 200:
                return None, "blocked"

            data        = resp.json()
            logger.debug("API response for %s: %s", receipt, data)
            case_status = data.get("case_status", {})
            form_type   = case_status.get("form_type", "")
            desc        = case_status.get("current_case_status_desc_en", "")

            if "140" not in form_type:
                return None, "skipped"

            if not is_tracked_case(form_type, desc):
                return None, "skipped"

            return {
                "receipt_number": receipt,
                "category":       get_case_category(form_type, desc),
                "status":         case_status.get("current_case_status_text_en", "Unknown"),
                "status_detail":  desc,
                "received_date":  case_status.get("received_date", ""),
            }, "found"

        except Exception as e:
            logger.error("API error for %s: %s", receipt, e)
            return None, "blocked"

    # ------------------------------------------------------------------
    # DB upsert + history
    # ------------------------------------------------------------------

    def upsert_case(self, data: dict, center: str):
        receipt  = data["receipt_number"]
        existing = self.db.query(Case).filter(Case.receipt_number == receipt).first()

        if existing:
            if existing.status != data["status"]:
                self.db.add(CaseStatusHistory(
                    receipt_number=receipt,
                    status=data["status"],
                    status_detail=data["status_detail"],
                ))
            existing.status        = data["status"]
            existing.status_detail = data["status_detail"]
            existing.received_date = data["received_date"]
            existing.last_updated  = datetime.utcnow()
        else:
            self.db.add(Case(
                receipt_number=receipt,
                service_center=center,
                category=data.get("category"),
                block=receipt[3:8],
                status=data["status"],
                status_detail=data["status_detail"],
                received_date=data["received_date"],
            ))
            self.db.add(CaseStatusHistory(
                receipt_number=receipt,
                status=data["status"],
                status_detail=data["status_detail"],
            ))

        self.db.commit()

    # ------------------------------------------------------------------
    # Block scraper (API → browser fallback)
    # ------------------------------------------------------------------

    async def scrape_block(
        self,
        client: httpx.AsyncClient,
        center: str,
        year_str: str,
        block: int,
        block_digits: int,
        seq_limit: int,
        run: ScrapeRun,
    ):
        token = await token_manager.get_token(client)
        sem   = asyncio.Semaphore(CONCURRENCY)

        consecutive_not_found = 0
        cases_in_block        = 0
        all_receipts          = list(build_receipts_for_plan_entry(
            center, year_str, block, block_digits, seq_limit
        ))

        for batch_start in range(0, len(all_receipts), BATCH_SIZE):
            # Early termination: once we've found at least 1 case and hit a long
            # gap of 404s, the rest of the block is almost certainly empty.
            if cases_in_block > 0 and consecutive_not_found >= EARLY_STOP_THRESHOLD:
                logger.info(
                    "Early stop %s%s%0*d at seq %d (%d consecutive not-found)",
                    center, year_str, block_digits, block,
                    batch_start, consecutive_not_found,
                )
                break

            batch = all_receipts[batch_start : batch_start + BATCH_SIZE]
            batch_outcomes: list[str] = []

            async def check_one(receipt, _tok=token):
                nonlocal token
                async with sem:
                    await asyncio.sleep(REQUEST_DELAY)
                    result, outcome = await self.check_case_api(client, receipt, _tok)
                    run.cases_checked += 1

                    if outcome == "blocked":
                        run.blocked_count += 1
                        result = await check_case_browser(receipt)
                        if result:
                            outcome = "found"
                        else:
                            token = await token_manager.get_token(client)
                            batch_outcomes.append("blocked")
                            return
                    else:
                        run.successful_requests += 1

                    if outcome == "found" and result:
                        run.cases_found += 1
                        self.upsert_case(result, center)
                        logger.info(
                            "Found %s %s — %s",
                            result.get("category", "I-140"),
                            receipt, result["status"],
                        )

                    token = await token_manager.get_token(client)
                    batch_outcomes.append(outcome)

            await asyncio.gather(*[check_one(r) for r in batch])

            batch_found = batch_outcomes.count("found")
            cases_in_block += batch_found
            if batch_found > 0:
                consecutive_not_found = 0
            else:
                consecutive_not_found += len(batch)

    # ------------------------------------------------------------------
    # Full run
    # ------------------------------------------------------------------

    async def run(self):
        run = ScrapeRun(started_at=datetime.utcnow(), status="running")
        self.db.add(run)
        self.db.commit()

        try:
            async with httpx.AsyncClient() as client:
                for center, year_str, block_range, block_digits, seq_limit in SCAN_PLAN:
                    for block in block_range:
                        logger.info(
                            "Scraping %s%s%0*d…", center, year_str, block_digits, block
                        )
                        await self.scrape_block(
                            client, center, year_str, block, block_digits, seq_limit, run
                        )
                        self.db.commit()

            run.status = "completed"

        except Exception as e:
            logger.error("Scrape run failed: %s", e)
            run.status = "failed"

        finally:
            run.finished_at = datetime.utcnow()
            self.db.commit()
            block_rate = round(run.blocked_count / max(run.cases_checked, 1) * 100, 1)
            logger.info(
                "Scrape done: checked=%d found=%d blocked=%d (%.1f%%) successful=%d",
                run.cases_checked, run.cases_found,
                run.blocked_count, block_rate, run.successful_requests,
            )
