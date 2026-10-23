from fastapi import APIRouter, Query, HTTPException
from app.services.procurement_service import procurement_service
from app.models.schemas import ProcurementSimulationResponse

router = APIRouter(prefix="/procurement", tags=["Procurement & Thermal Decision Engine"])

@router.get("/simulate", response_model=ProcurementSimulationResponse)
async def simulate_procurement_decision(
    date: str = Query("2026-01-15", description="Delivery date (YYYY-MM-DD) in January 2026"),
    gate_closure: str = Query("11:00", description="Day-ahead gate closure time on D-1"),
    scenario: str = Query("typical_winter_weekday", description="Consumer demand scenario")
):
    """
    Simulates Day-Ahead power procurement: calculates Net Thermal Procurement required
    beyond forecasted wind, evaluates resulting balancing imbalance, and sizes quantified risk buffer.
    """
    try:
        return procurement_service.simulate_day_ahead_procurement(
            delivery_date=date,
            gate_closure_time=gate_closure,
            scenario_key=scenario
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Procurement simulation failed: {str(e)}")

@router.get("/scenarios")
async def list_demand_scenarios():
    """Returns available UK consumer demand profile templates."""
    return procurement_service.DEMAND_PROFILES
