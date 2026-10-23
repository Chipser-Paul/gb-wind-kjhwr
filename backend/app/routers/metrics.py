from fastapi import APIRouter, Query, HTTPException
from app.services.metrics_engine import metrics_engine
from app.models.schemas import OverallMetricsResponse

router = APIRouter(prefix="/metrics", tags=["Metrics & Accuracy Evaluation"])

@router.get("/evaluate", response_model=OverallMetricsResponse)
async def evaluate_forecast_accuracy(
    gate_closure: str = Query("11:00", description="Day-ahead gate closure cutoff time (e.g. 11:00)"),
    start_day: int = Query(1, ge=1, le=31, description="Start day in January 2026"),
    end_day: int = Query(31, ge=1, le=31, description="End day in January 2026")
):
    """
    Evaluates quantitative accuracy metrics across January 2026:
    MAE, RMSE, MAPE, Bias, Error Distribution, and Settlement Period Hourly Profiles.
    """
    if start_day > end_day:
        raise HTTPException(status_code=400, detail="start_day cannot be greater than end_day")
    try:
        return metrics_engine.evaluate_overall_month(
            gate_closure_cutoff=gate_closure,
            start_day=start_day,
            end_day=end_day
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute accuracy metrics: {str(e)}")
