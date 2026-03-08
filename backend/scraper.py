import asyncio
import logging
from datetime import datetime

import httpx

from auth import token_manager, API_URL
from models import Case, CaseStatusHistory, ScrapeRun

logger = logging.getLogger(__name__)

# NIW keywords to match against form_type and case description
_NIW_KEYWORDS = ["national interest waiver", "niw", "eb-22", "eb22"]


def is_niw_case(form_type: str, desc: str) -> bool:
    """Return True if the case is an I-140 National Interest Waiver."""
    combined = (form_type + " " + desc).lower()
    return any(kw in combined for kw in _NIW_KEYWORDS)


# Service center prefixes for I-140
SERVICE_CENTERS = ["IOE", "MSC", "EAC", "WAC", "LIN", "SRC", "NBC"]

# How many concurrent requests to run (keep low to avoid rate limits)
CONCURRENCY = 3

# Delay between requests in seconds
REQUEST_DELAY = 0.5


def generate_receipt_numbers(year: int, center: str, start: int, end: int):
    """Generate receipt numbers like IOE2512345678"""
    for i in range(start, end):
        # Format: PREFIX + 2-digit year + 2-digit... actually USCIS format varies
        # Standard format: IOE + 10 digits
        suffix = str(i).zfill(10)
        yield f"{center}{str(year)[-2:]}{suffix[2:]}"


def build_receipt_numbers_for_block(center: str, year_short: int, block: int):
    """
    Build a block of receipt numbers.
    USCIS receipt numbers: e.g. IOE2590123456
    Format: 3-letter center + 2-digit year + 2-digit month-ish + 6-digit seq
    We iterate sequential blocks.
    """
    base = f"{center}{year_short:02d}{block:02d}"
    for seq in range(0, 10000):
        yield f"{base}{seq:06d}"


class CaseScraper:
    def __init__(self, db):
        self.db = db

    async def check_case(self, client: httpx.AsyncClient, receipt: str, token: str) -> dict | None:
        try:
            url = API_URL.format(receipt=receipt)
            resp = await client.get(
                url,
                headers={"Authorization": f"Bearer {token}"},
                timeout=15,
            )
            if resp.status_code == 404:
                return None
            if resp.status_code == 429:
                logger.warning("Rate limited, sleeping 10s")
                await asyncio.sleep(10)
                return None
            if resp.status_code != 200:
                return None

            data = resp.json()
            logger.debug("Raw response for %s: %s", receipt, data)

            case_status = data.get("case_status", {})
            form_type = case_status.get("form_type", "")
            desc = case_status.get("current_case_status_desc_en", "")

            # Only care about I-140
            if "140" not in form_type:
                return None

            # Only keep NIW (National Interest Waiver) cases
            if not is_niw_case(form_type, desc):
                return None

            return {
                "receipt_number": receipt,
                "status": case_status.get("current_case_status_text_en", "Unknown"),
                "status_detail": desc,
                "received_date": case_status.get("received_date", ""),
            }
        except Exception as e:
            logger.error("Error checking %s: %s", receipt, e)
            return None

    def upsert_case(self, data: dict, center: str):
        receipt = data["receipt_number"]
        existing = self.db.query(Case).filter(Case.receipt_number == receipt).first()

        if existing:
            if existing.status != data["status"]:
                # Status changed — record the transition
                self.db.add(CaseStatusHistory(
                    receipt_number=receipt,
                    status=data["status"],
                    status_detail=data["status_detail"],
                ))
            existing.status = data["status"]
            existing.status_detail = data["status_detail"]
            existing.received_date = data["received_date"]
            existing.last_updated = datetime.utcnow()
        else:
            self.db.add(Case(
                receipt_number=receipt,
                service_center=center,
                block=receipt[3:8],
                status=data["status"],
                status_detail=data["status_detail"],
                received_date=data["received_date"],
            ))
            # Record initial status
            self.db.add(CaseStatusHistory(
                receipt_number=receipt,
                status=data["status"],
                status_detail=data["status_detail"],
            ))

        self.db.commit()

    async def scrape_block(self, client: httpx.AsyncClient, center: str, year_short: int, block: int, run: ScrapeRun):
        token = await token_manager.get_token(client)
        receipts = list(build_receipt_numbers_for_block(center, year_short, block))
        sem = asyncio.Semaphore(CONCURRENCY)

        async def check_one(receipt):
            nonlocal token
            async with sem:
                await asyncio.sleep(REQUEST_DELAY)
                result = await self.check_case(client, receipt, token)
                run.cases_checked += 1

                if result:
                    run.cases_found += 1
                    self.upsert_case(result, center)
                    logger.info("Found I-140: %s - %s", receipt, result["status"])

                # Refresh token if needed
                token = await token_manager.get_token(client)

        await asyncio.gather(*[check_one(r) for r in receipts])

    async def run(self):
        run = ScrapeRun(started_at=datetime.utcnow(), status="running")
        self.db.add(run)
        self.db.commit()

        try:
            async with httpx.AsyncClient() as client:
                # Scrape recent year blocks
                for year_short in [24, 25]:  # 2024, 2025
                    for center in SERVICE_CENTERS:
                        for block in range(1, 13):  # months 01-12
                            logger.info(
                                "Scraping %s%02d%02d...", center, year_short, block
                            )
                            await self.scrape_block(client, center, year_short, block, run)
                            self.db.commit()

            run.status = "completed"
        except Exception as e:
            logger.error("Scrape run failed: %s", e)
            run.status = "failed"
        finally:
            run.finished_at = datetime.utcnow()
            self.db.commit()
            logger.info(
                "Scrape done: checked=%d found=%d",
                run.cases_checked,
                run.cases_found,
            )
