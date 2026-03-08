"""
Unit tests for NIW filtering logic in scraper.py.

These tests mock the USCIS HTTP API so no real network calls are made.
The mock responses reflect the expected USCIS case-status API shape:

  {
    "case_status": {
      "form_type": "<string>",
      "current_case_status_text_en": "<string>",
      "current_case_status_desc_en": "<string>",
      "received_date": "<string>"
    }
  }

Run with:
    cd backend && pytest tests/test_scraper.py -v
"""

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from scraper import CaseScraper, is_niw_case


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mock_response(status_code: int, json_body: dict):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_body
    return resp


def _niw_response():
    """Typical NIW approved case response."""
    return {
        "case_status": {
            "form_type": "I-140",
            "current_case_status_text_en": "Case Was Approved",
            "current_case_status_desc_en": (
                "On January 15, 2025, we approved your Form I-140, Immigrant "
                "Petition for Alien Workers, for the classification of Alien of "
                "Exceptional Ability (National Interest Waiver). ..."
            ),
            "received_date": "January 10, 2025",
        }
    }


def _eb1a_response():
    """Non-NIW I-140 case (EB-1A Extraordinary Ability)."""
    return {
        "case_status": {
            "form_type": "I-140",
            "current_case_status_text_en": "Case Was Approved",
            "current_case_status_desc_en": (
                "On January 15, 2025, we approved your Form I-140, Immigrant "
                "Petition for Alien Workers, for the classification of Alien of "
                "Extraordinary Ability. ..."
            ),
            "received_date": "January 10, 2025",
        }
    }


def _i485_response():
    """Completely different form type — should be filtered out."""
    return {
        "case_status": {
            "form_type": "I-485",
            "current_case_status_text_en": "Case Was Received",
            "current_case_status_desc_en": "We received your Form I-485.",
            "received_date": "January 10, 2025",
        }
    }


# ---------------------------------------------------------------------------
# is_niw_case unit tests (pure function — no async needed)
# ---------------------------------------------------------------------------

class TestIsNiwCase:
    def test_national_interest_waiver_in_desc(self):
        assert is_niw_case("I-140", "Alien of Exceptional Ability (National Interest Waiver)")

    def test_niw_abbreviation_in_desc(self):
        assert is_niw_case("I-140", "approved as NIW")

    def test_niw_in_form_type(self):
        assert is_niw_case("I-140 National Interest Waiver", "")

    def test_eb22_keyword(self):
        assert is_niw_case("I-140", "classification EB-22")

    def test_eb1a_is_not_niw(self):
        assert not is_niw_case("I-140", "Alien of Extraordinary Ability")

    def test_empty_strings(self):
        assert not is_niw_case("", "")

    def test_case_insensitive(self):
        assert is_niw_case("I-140", "NATIONAL INTEREST WAIVER")


# ---------------------------------------------------------------------------
# CaseScraper.check_case integration tests (mocked HTTP)
# ---------------------------------------------------------------------------

@pytest.fixture
def scraper():
    db = MagicMock()
    return CaseScraper(db)


@pytest.mark.asyncio
async def test_niw_case_is_returned(scraper):
    client = AsyncMock()
    client.get.return_value = _mock_response(200, _niw_response())

    result = await scraper.check_case(client, "IOE2590000001", "fake-token")

    assert result is not None
    assert result["receipt_number"] == "IOE2590000001"
    assert result["status"] == "Case Was Approved"
    assert "National Interest Waiver" in result["status_detail"]


@pytest.mark.asyncio
async def test_non_niw_i140_is_filtered(scraper):
    """EB-1A (Extraordinary Ability) I-140 must be excluded."""
    client = AsyncMock()
    client.get.return_value = _mock_response(200, _eb1a_response())

    result = await scraper.check_case(client, "IOE2590000002", "fake-token")

    assert result is None


@pytest.mark.asyncio
async def test_non_i140_form_is_filtered(scraper):
    """I-485 and other forms must be excluded."""
    client = AsyncMock()
    client.get.return_value = _mock_response(200, _i485_response())

    result = await scraper.check_case(client, "IOE2590000003", "fake-token")

    assert result is None


@pytest.mark.asyncio
async def test_404_returns_none(scraper):
    client = AsyncMock()
    client.get.return_value = _mock_response(404, {})

    result = await scraper.check_case(client, "IOE2590000004", "fake-token")

    assert result is None


@pytest.mark.asyncio
async def test_rate_limit_returns_none(scraper):
    client = AsyncMock()
    client.get.return_value = _mock_response(429, {})

    with patch("scraper.asyncio.sleep", new_callable=AsyncMock):
        result = await scraper.check_case(client, "IOE2590000005", "fake-token")

    assert result is None


@pytest.mark.asyncio
async def test_niw_case_fields_are_complete(scraper):
    """All expected keys must be present in the returned dict."""
    client = AsyncMock()
    client.get.return_value = _mock_response(200, _niw_response())

    result = await scraper.check_case(client, "IOE2590000006", "fake-token")

    assert result is not None
    assert set(result.keys()) == {"receipt_number", "status", "status_detail", "received_date"}
