import os
import time
import httpx
import logging

logger = logging.getLogger(__name__)

CLIENT_ID = os.getenv("USCIS_CLIENT_ID", "phlZGw79TtreSBS9Yyqe28YZylbjyidG")
CLIENT_SECRET = os.getenv("USCIS_CLIENT_SECRET", "rJPPMj674uZYAVnd")

SANDBOX_AUTH_URL = "https://api-int.uscis.gov/oauth/accesstoken"
SANDBOX_API_URL = "https://api-int.uscis.gov/case-status/{receipt}"

PROD_AUTH_URL = "https://api.uscis.gov/oauth/accesstoken"
PROD_API_URL = "https://api.uscis.gov/case-status/{receipt}"

USE_PROD = os.getenv("USE_PROD", "false").lower() == "true"

AUTH_URL = PROD_AUTH_URL if USE_PROD else SANDBOX_AUTH_URL
API_URL = PROD_API_URL if USE_PROD else SANDBOX_API_URL


class TokenManager:
    def __init__(self):
        self._token = None
        self._expires_at = 0

    async def get_token(self, client: httpx.AsyncClient) -> str:
        if self._token and time.time() < self._expires_at - 60:
            return self._token

        logger.info("Fetching new USCIS access token")
        resp = await client.post(
            AUTH_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        self._token = data["access_token"]
        self._expires_at = time.time() + int(data.get("expires_in", 1800))
        logger.info("Got new token, expires in %s seconds", data.get("expires_in"))
        return self._token


token_manager = TokenManager()
