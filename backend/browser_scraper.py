"""
Cloudflare-resilient browser scraper for USCIS egov case status.

Strategy
--------
1. Launch a stealthy Chromium via patchright (playwright fallback)
2. Navigate to egov.uscis.gov — Cloudflare Turnstile resolves automatically
3. Persist cf_clearance + session cookies to disk (~1 hr validity)
4. All subsequent case lookups use httpx with the stored cookies (fast)
5. On CF re-challenge (403/503), invalidate and re-acquire automatically

Modes
-----
BROWSER_HEADED=false  → headless (server default)
BROWSER_HEADED=true   → headed window (local debugging)
"""

import asyncio
import json
import logging
import os
import time
from pathlib import Path
from typing import Optional

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADED       = os.getenv("BROWSER_HEADED", "false").lower() == "true"
COOKIE_PATH  = Path("/tmp/uscis_cf_cookies.json")
COOKIE_TTL   = 3600  # seconds — cf_clearance typically lasts 1–2 hr

USCIS_EGOV       = "https://egov.uscis.gov"
USCIS_STATUS_URL = "https://egov.uscis.gov/casestatus/mycasestatus.do"

_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)

_BROWSER_HEADERS = {
    "User-Agent":      _UA,
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer":         USCIS_EGOV,
}


# ---------------------------------------------------------------------------
# Cookie store — in-memory with disk persistence
# ---------------------------------------------------------------------------

class _CookieStore:
    def __init__(self):
        self._cookies: dict = {}
        self._acquired_at: float = 0
        self._load()

    def _load(self):
        if COOKIE_PATH.exists():
            try:
                data = json.loads(COOKIE_PATH.read_text())
                if time.time() - data["acquired_at"] < COOKIE_TTL:
                    self._cookies     = data["cookies"]
                    self._acquired_at = data["acquired_at"]
                    logger.info("Loaded %d CF cookies from disk (age %.0fs)",
                                len(self._cookies), time.time() - self._acquired_at)
            except Exception as e:
                logger.warning("Could not load CF cookies from disk: %s", e)

    def save(self, cookies: dict):
        self._cookies     = cookies
        self._acquired_at = time.time()
        try:
            COOKIE_PATH.write_text(json.dumps({
                "cookies":     cookies,
                "acquired_at": self._acquired_at,
            }))
            logger.info("Persisted %d CF cookies to disk", len(cookies))
        except Exception as e:
            logger.warning("Could not persist CF cookies: %s", e)

    def get(self) -> dict:
        return self._cookies

    def is_fresh(self) -> bool:
        return bool(self._cookies) and (time.time() - self._acquired_at) < COOKIE_TTL

    def invalidate(self):
        logger.info("CF cookie store invalidated")
        self._cookies     = {}
        self._acquired_at = 0


cookie_store = _CookieStore()


# ---------------------------------------------------------------------------
# CF clearance acquisition
# ---------------------------------------------------------------------------

async def acquire_cf_clearance() -> bool:
    """
    Launch a browser, navigate to USCIS egov, wait for Cloudflare to resolve,
    then persist all cookies. Returns True on success.
    """
    # Try patchright first; fall back to stock playwright
    try:
        from patchright.async_api import async_playwright
        logger.info("Using patchright for CF bypass")
    except ImportError:
        try:
            from playwright.async_api import async_playwright
            logger.warning("patchright not installed — using playwright (CF bypass may be less reliable)")
        except ImportError:
            logger.error("Neither patchright nor playwright is installed")
            return False

    logger.info("Launching browser (headed=%s) to acquire CF clearance…", HEADED)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=not HEADED,
                args=[
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled",
                ],
            )
            ctx = await browser.new_context(
                user_agent=_UA,
                viewport={"width": 1366, "height": 768},
                locale="en-US",
            )
            page = await ctx.new_page()

            await page.goto(USCIS_EGOV, wait_until="domcontentloaded", timeout=60_000)

            # Wait up to 45 s for CF challenge to clear
            for i in range(45):
                title = (await page.title()).lower()
                if "just a moment" not in title and "checking your browser" not in title:
                    logger.info("CF challenge resolved after %ds", i)
                    break
                logger.debug("Waiting for CF challenge… (%s)", title)
                await asyncio.sleep(1)

            await asyncio.sleep(2)   # let cookies settle

            raw     = await ctx.cookies()
            cookies = {c["name"]: c["value"] for c in raw}
            await browser.close()

        if "cf_clearance" in cookies:
            logger.info("cf_clearance obtained ✓")
        else:
            logger.warning("cf_clearance not in cookies — CF may not have resolved")

        if cookies:
            cookie_store.save(cookies)
            return True
        return False

    except Exception as e:
        logger.error("Browser CF acquisition failed: %s", e)
        return False


# ---------------------------------------------------------------------------
# HTML parser for USCIS egov status page
# ---------------------------------------------------------------------------

def _parse_status_html(html: str, receipt: str) -> Optional[dict]:
    """Extract case status text and description from USCIS egov HTML."""
    try:
        soup = BeautifulSoup(html, "html.parser")

        # USCIS has used several markup variants over the years — try each
        status_el = (
            soup.select_one("h4.current-status-title") or
            soup.select_one(".rows.show-section h4") or
            soup.select_one("div.appointment-sec h4") or
            soup.select_one("div.case-status h4") or
            soup.select_one("h1")
        )
        desc_el = (
            soup.select_one(".current-status-desc p") or
            soup.select_one(".rows.show-section p") or
            soup.select_one("div.appointment-sec p")
        )

        if not status_el:
            return None

        status = status_el.get_text(strip=True)
        desc   = desc_el.get_text(strip=True) if desc_el else ""

        if not status:
            return None

        return {
            "receipt_number": receipt,
            "status":         status,
            "status_detail":  desc,
            "received_date":  "",
        }
    except Exception as e:
        logger.error("HTML parse error for %s: %s", receipt, e)
        return None


# ---------------------------------------------------------------------------
# Main browser-path case check (uses stored cookies + httpx)
# ---------------------------------------------------------------------------

async def check_case_browser(receipt: str, _retry: bool = True) -> Optional[dict]:
    """
    Check a single case via USCIS egov using stored CF cookies.
    Falls back to re-acquiring clearance if the cookie has expired.
    """
    if not cookie_store.is_fresh():
        logger.info("CF cookies stale — re-acquiring…")
        ok = await acquire_cf_clearance()
        if not ok:
            logger.error("Could not acquire CF clearance — browser path unavailable")
            return None

    cookies = cookie_store.get()

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=20) as client:
            resp = await client.get(
                USCIS_STATUS_URL,
                params={"appReceiptNum": receipt},
                headers=_BROWSER_HEADERS,
                cookies=cookies,
            )

        body = resp.text.lower()

        # Detect CF re-challenge
        if resp.status_code in (403, 503) or "just a moment" in body or "cf-challenge" in body:
            logger.warning("CF re-challenge detected for %s (status %d)", receipt, resp.status_code)
            cookie_store.invalidate()
            if _retry:
                return await check_case_browser(receipt, _retry=False)
            return None

        if resp.status_code != 200:
            logger.warning("Browser path got HTTP %d for %s", resp.status_code, receipt)
            return None

        return _parse_status_html(resp.text, receipt)

    except Exception as e:
        logger.error("Browser check failed for %s: %s", receipt, e)
        return None
