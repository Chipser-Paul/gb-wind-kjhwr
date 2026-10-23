import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Gridbricks UK Wind Forecast & Procurement Portal"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ELEXON_BASE_URL: str = os.getenv("ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")
    DEFAULT_GATE_CLOSURE: str = "11:00"  # Standard UK Day-Ahead auction gate closure time on D-1
    DATA_CACHE_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jan2026_cache.json")
    CORS_ORIGINS: list = ["*"]
    REQUEST_TIMEOUT_SECONDS: int = 25

settings = Settings()
