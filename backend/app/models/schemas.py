from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ActualRecord(BaseModel):
    startTime: str
    settlementDate: str
    settlementPeriod: int
    fuelType: str = "WIND"
    generation: float

class ForecastRecord(BaseModel):
    publishTime: str
    startTime: str
    generation: float
    settlementDate: Optional[str] = None
    settlementPeriod: Optional[int] = None

class ReconciledPeriod(BaseModel):
    settlementDate: str
    settlementPeriod: int
    startTime: str
    actual_mw: Optional[float] = None
    forecast_mw: float
    forecast_publish_time: str
    error_mw: Optional[float] = None  # forecast - actual (positive = overforecast, negative = underforecast)
    abs_error_mw: Optional[float] = None
    percentage_error: Optional[float] = None

class DailyMetric(BaseModel):
    date: str
    mean_actual_mw: float
    mean_forecast_mw: float
    mae_mw: float
    rmse_mw: float
    mape_pct: float
    bias_mw: float
    max_overforecast_mw: float
    max_underforecast_mw: float
    total_actual_mwh: float
    total_forecast_mwh: float
    net_imbalance_mwh: float

class PeriodHourlyError(BaseModel):
    settlementPeriod: int
    hourLabel: str
    mae_mw: float
    rmse_mw: float
    bias_mw: float
    mean_actual_mw: float
    mean_forecast_mw: float

class ErrorDistributionBin(BaseModel):
    range_label: str
    min_mw: float
    max_mw: float
    count: int
    percentage: float

class OverallMetricsResponse(BaseModel):
    period_start: str
    period_end: str
    gate_closure_cutoff: str
    total_periods_evaluated: int
    mae_mw: float
    rmse_mw: float
    mape_pct: float
    bias_mw: float
    p50_abs_error_mw: float
    p90_abs_error_mw: float
    correlation_coefficient: float
    daily_metrics: List[DailyMetric]
    hourly_profile: List[PeriodHourlyError]
    error_distribution: List[ErrorDistributionBin]

class ForecastComparisonResponse(BaseModel):
    date: str
    gate_closure_cutoff: str
    periods: List[ReconciledPeriod]
    day_summary: DailyMetric

class ProcurementPeriod(BaseModel):
    settlementPeriod: int
    startTime: str
    hourLabel: str
    consumer_demand_mw: float
    wind_forecast_mw: float
    net_thermal_procured_mw: float
    wind_actual_mw: float
    actual_thermal_needed_mw: float
    imbalance_mw: float  # wind_actual - wind_forecast: if positive, long; if negative, short
    imbalance_mwh: float
    recommended_safety_reserve_mw: float
    risk_level: str  # "LOW", "MEDIUM", "HIGH" based on forecast uncertainty

class ProcurementSimulationResponse(BaseModel):
    delivery_date: str
    gate_closure_time: str
    demand_scenario: str
    total_consumer_demand_mwh: float
    total_forecasted_wind_mwh: float
    total_thermal_procured_mwh: float
    total_actual_wind_mwh: float
    total_actual_thermal_needed_mwh: float
    net_energy_imbalance_mwh: float
    procurement_accuracy_pct: float
    recommended_total_reserve_mwh: float
    periods: List[ProcurementPeriod]
