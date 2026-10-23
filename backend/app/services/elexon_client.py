import logging
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("elexon_client")

class ElexonClient:
    """Client for Elexon BMRS Insights Solution REST API (stream endpoints)."""

    def __init__(self, base_url: str = settings.ELEXON_BASE_URL, timeout: int = settings.REQUEST_TIMEOUT_SECONDS):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def fetch_actual_wind_generation(
        self,
        settlement_date_from: str,
        settlement_date_to: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch half-hourly outturn generation for fuelType WIND.
        Endpoint: /datasets/FUELHH/stream
        """
        url = f"{self.base_url}/datasets/FUELHH/stream"
        params = {
            "settlementDateFrom": settlement_date_from,
            "settlementDateTo": settlement_date_to,
            "fuelType": "WIND"
        }
        headers = {"Accept": "application/json"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Fetching FUELHH from {url} with params {params}")
                response = await client.get(url, params=params, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        return [row for row in data if str(row.get("fuelType", "")).upper() == "WIND"]
                    return []
                else:
                    logger.warning(f"Elexon FUELHH returned HTTP {response.status_code}: {response.text[:200]}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching actuals from Elexon: {e}")
            return []

    async def fetch_wind_forecasts(
        self,
        publish_time_from: str,
        publish_time_to: str
    ) -> List[Dict[str, Any]]:
        """
        Fetch wind generation forecasts.
        Endpoint: /datasets/WINDFOR/stream
        """
        url = f"{self.base_url}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": publish_time_from,
            "publishDateTimeTo": publish_time_to
        }
        headers = {"Accept": "application/json"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Fetching WINDFOR from {url} with params {params}")
                response = await client.get(url, params=params, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    return data if isinstance(data, list) else []
                else:
                    logger.warning(f"Elexon WINDFOR returned HTTP {response.status_code}: {response.text[:200]}")
                    return []
        except Exception as e:
            logger.error(f"Error fetching forecasts from Elexon: {e}")
            return []

elexon_client = ElexonClient()
