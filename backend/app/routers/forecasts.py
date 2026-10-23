from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.forecast_service import forecast_service
from app.services.elexon_client import elexon_client
from app.models.schemas import ForecastComparisonResponse

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

@router.get("/daily", response_model=ForecastComparisonResponse)
async def get_daily_forecast_comparison(
    date: str = Query("2026-01-15", description="Delivery date (YYYY-MM-DD) in January 2026"),
    gate_closure: str = Query("11:00", description="Day-ahead decision gate closure time on D-1 (HH:MM)")
):
    """
    Returns the latest wind generation forecast available at or before the specified
    gate closure time on D-1, paired with actual half-hourly outturn generation.
    """
    try:
        periods = forecast_service.get_reconciled_day(date, gate_closure)
        summary = forecast_service.calculate_day_summary(periods, date)
        return ForecastComparisonResponse(
            date=date,
            gate_closure_cutoff=gate_closure,
            periods=periods,
            day_summary=summary
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate forecast comparison: {str(e)}")

@router.post("/sync-elexon")
async def trigger_elexon_sync(
    settlement_date_from: str = Query("2026-01-01"),
    settlement_date_to: str = Query("2026-01-02")
):
    """
    Triggers an on-demand sync from official Elexon BMRS streaming APIs.
    """
    actuals = await elexon_client.fetch_actual_wind_generation(settlement_date_from, settlement_date_to)
    return {
        "status": "success" if actuals else "fallback_active",
        "records_fetched": len(actuals),
        "message": "Live Elexon stream queried successfully." if actuals else "Live Elexon endpoint unavailable or rate limited; cached high-fidelity January 2026 data active."
    }
