from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import forecasts, metrics, procurement
from app.services.data_loader import data_loader

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## Gridbricks UK Wind Forecast & Procurement Portal API
    
    A specialized decision-support platform for UK energy utility trading desks participating in the Day-Ahead Wholesale Electricity Market.
    
    ### Key Capabilities:
    1. **Gate Closure Forecast Resolution**: Identifies the latest available national wind generation forecast published prior to the Day-Ahead auction cutoff (e.g. 11:00 UTC on D-1) from Elexon BMRS datasets.
    2. **Quantitative Error Evaluation**: Rigorous statistical error modeling (MAE, RMSE, MAPE, Bias, P90 risk margins, and diurnal half-hourly profiles).
    3. **Net Thermal Procurement Optimization**: Simulates required thermal generation purchases and balances market cashout exposure against consumer demand.
    """
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(forecasts.router, prefix=settings.API_PREFIX)
app.include_router(metrics.router, prefix=settings.API_PREFIX)
app.include_router(procurement.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
async def startup_event():
    """Pre-load and index January 2026 dataset on server startup."""
    data_loader.load_data()

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "dataset_scope": "January 2026 (Elexon FUELHH & WINDFOR)"
    }
