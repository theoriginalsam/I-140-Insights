import asyncio
import logging
from datetime import datetime

import httpx

from auth import token_manager, API_URL
from browser_scraper import check_case_browser
from models import Case, CaseStatusHistory, ScrapeRun

logger = logging.getLogger(__name__)

_NIW_KEYWORDS = ["national interest waiver", "niw", "eb-22", "eb22"]

SERVICE_CENTERS = ["IOE", "MSC", "EAC", "WAC", "LIN", "SRC", "NBC"]
CONCURRENCY   = 3
REQUEST_DELAY = 0.5


def is_niw_case(form_type: str, desc: str) -> bool:
    """Return True if the case is an I-140 National Interest Waiver."""
    combined = (form_type + " " + desc).lower()
    return any(kw in combined for kw in _NIW_KEYWORDS)


def build_receipt_numbers_for_block(center: str, year_short: int, block: int):
    base = f"{center}{year_short:02d}{block:02d}"
    for seq in range(0, 10_000):
        yield f"{base}{seq:06d}"


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
                logger.warning("Rate limited, sleeping 10s")
                await asyncio.sleep(10)
                return None, "blocked"

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

            if not is_niw_case(form_type, desc):
                return None, "skipped"

            return {
                "receipt_number": receipt,
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
        year_short: int,
        block: int,
        run: ScrapeRun,
    ):
        token    = await token_manager.get_token(client)
        receipts = list(build_receipt_numbers_for_block(center, year_short, block))
        sem      = asyncio.Semaphore(CONCURRENCY)

        async def check_one(receipt):
            nonlocal token
            async with sem:
                await asyncio.sleep(REQUEST_DELAY)

                result, outcome = await self.check_case_api(client, receipt, token)
                run.cases_checked += 1

                if outcome == "blocked":
                    run.blocked_count += 1
                    # Fallback: try the browser / CF path
                    logger.debug("API blocked for %s — trying browser path", receipt)
                    result = await check_case_browser(receipt)
                    if result:
                        outcome = "found"
                    else:
                        token = await token_manager.get_token(client)
                        return
                else:
                    run.successful_requests += 1

                if outcome == "found" and result:
                    run.cases_found += 1
                    self.upsert_case(result, center)
                    logger.info("Found I-140 NIW: %s — %s", receipt, result["status"])

                token = await token_manager.get_token(client)

        await asyncio.gather(*[check_one(r) for r in receipts])

    # ------------------------------------------------------------------
    # Full run
    # ------------------------------------------------------------------

    async def run(self):
        run = ScrapeRun(started_at=datetime.utcnow(), status="running")
        self.db.add(run)
        self.db.commit()

        try:
            async with httpx.AsyncClient() as client:
                for year_short in [24, 25]:
                    for center in SERVICE_CENTERS:
                        for block in range(1, 13):
                            logger.info("Scraping %s%02d%02d…", center, year_short, block)
                            await self.scrape_block(client, center, year_short, block, run)
                            self.db.commit()

            run.status = "completed"

        except Exception as e:
            logger.error("Scrape run failed: %s", e)
            run.status = "failed"

        finally:
            run.finished_at = datetime.utcnow()
            self.db.commit()
            block_rate = (
                round(run.blocked_count / max(run.cases_checked, 1) * 100, 1)
            )
            logger.info(
                "Scrape done: checked=%d found=%d blocked=%d (%.1f%%) successful=%d",
                run.cases_checked, run.cases_found,
                run.blocked_count, block_rate, run.successful_requests,
            )
