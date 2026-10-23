import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.data_loader import data_loader
from app.services.forecast_service import forecast_service
from app.services.metrics_engine import metrics_engine
from app.services.procurement_service import procurement_service

# Use starlette TestClient
try:
    from starlette.testclient import TestClient
    client = TestClient(app)
except Exception:
    client = None

def test_data_loader_structure():
    """Verify data loader produces exactly 1,488 periods for January 2026."""
    data = data_loader.load_data()
    actuals = data.get("actuals", [])
    forecasts = data.get("forecasts", [])
    
    assert len(actuals) == 31 * 48, f"Expected 1488 actual periods, got {len(actuals)}"
    assert len(forecasts) > 0, "Forecast list should not be empty"
    
    # Check Jan 1 Period 1
    sample = actuals[0]
    assert sample["settlementDate"] == "2026-01-01"
    assert sample["settlementPeriod"] == 1
    assert sample["fuelType"] == "WIND"
    assert sample["generation"] > 0
    print("PASS: test_data_loader_structure")

def test_forecast_reconciliation():
    """Verify gate-closure filtering selects latest forecast prior to D-1 cutoff."""
    periods = forecast_service.get_reconciled_day("2026-01-15", gate_closure_time="11:00")
    assert len(periods) == 48, f"Expected 48 periods in a delivery day, got {len(periods)}"
    
    for p in periods:
        assert p.settlementDate == "2026-01-15"
        assert 1 <= p.settlementPeriod <= 48
        assert p.actual_mw is not None
        assert p.forecast_mw > 0
        assert p.error_mw == round(p.forecast_mw - p.actual_mw, 1)
        assert p.abs_error_mw == round(abs(p.forecast_mw - p.actual_mw), 1)
    print("PASS: test_forecast_reconciliation")

def test_daily_summary_metrics():
    """Verify daily MAE, RMSE, and Imbalance calculation."""
    periods = forecast_service.get_reconciled_day("2026-01-10", "11:00")
    summary = forecast_service.calculate_day_summary(periods, "2026-01-10")
    
    assert summary.date == "2026-01-10"
    assert summary.mae_mw >= 0
    assert summary.rmse >= summary.mae_mw  # Mathematical property: RMSE >= MAE
    assert summary.total_actual_mwh > 0
    assert summary.total_forecast_mwh > 0
    print("PASS: test_daily_summary_metrics")

def test_metrics_engine_monthly_evaluation():
    """Verify monthly metrics engine evaluates all 31 days and produces histograms and hourly curves."""
    metrics = metrics_engine.evaluate_overall_month(gate_closure_cutoff="11:00", start_day=1, end_day=31)
    
    assert metrics.total_periods_evaluated == 31 * 48
    assert metrics.mae_mw > 0
    assert metrics.rmse > 0
    assert len(metrics.daily_metrics) == 31
    assert len(metrics.hourly_profile) == 48
    assert len(metrics.error_distribution) == 8
    assert metrics.p90_abs_error_mw >= metrics.p50_abs_error_mw
    print("PASS: test_metrics_engine_monthly_evaluation")

def test_procurement_simulation():
    """Verify thermal procurement calculation: Demand - Wind Forecast = Net Thermal."""
    res = procurement_service.simulate_day_ahead_procurement("2026-01-20", "11:00", "typical_winter_weekday")
    
    assert res.delivery_date == "2026-01-20"
    assert len(res.periods) == 48
    assert res.total_consumer_demand_mwh > res.total_forecasted_wind_mwh
    assert res.total_thermal_procured_mwh > 0
    
    for p in res.periods:
        expected_thermal = round(max(0.0, p.consumer_demand_mw - p.wind_forecast_mw), 1)
        assert p.net_thermal_procured_mw == expected_thermal
        assert p.risk_level in ["LOW", "MEDIUM", "HIGH"]
    print("PASS: test_procurement_simulation")

def test_api_endpoints():
    """Verify FastAPI HTTP endpoints return 200 OK and valid schemas."""
    if client is None:
        print("SKIP: TestClient not available")
        return
        
    # Health
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
    
    # Forecasts Daily
    r = client.get("/api/forecasts/daily?date=2026-01-15&gate_closure=11:00")
    assert r.status_code == 200
    data = r.json()
    assert data["date"] == "2026-01-15"
    assert len(data["periods"]) == 48
    
    # Metrics Evaluation
    r = client.get("/api/metrics/evaluate?gate_closure=11:00&start_day=1&end_day=5")
    assert r.status_code == 200
    assert r.json()["total_periods_evaluated"] == 5 * 48
    
    # Procurement Simulation
    r = client.get("/api/procurement/simulate?date=2026-01-15&gate_closure=11:00&scenario=typical_winter_weekday")
    assert r.status_code == 200
    assert r.json()["total_thermal_procured_mwh"] > 0
    print("PASS: test_api_endpoints")

if __name__ == "__main__":
    print("--- Running Gridbricks Wind Forecast & Procurement Portal Backend Tests ---")
    test_data_loader_structure()
    test_forecast_reconciliation()
    test_daily_summary_metrics()
    test_metrics_engine_monthly_evaluation()
    test_procurement_simulation()
    test_api_endpoints()
    print("--- ALL TESTS PASSED! ---")
