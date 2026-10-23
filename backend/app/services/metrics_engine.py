import numpy as np
from typing import List, Dict, Any
from datetime import datetime
from app.services.forecast_service import forecast_service
from app.models.schemas import (
    OverallMetricsResponse, DailyMetric, PeriodHourlyError, ErrorDistributionBin, ReconciledPeriod
)

class MetricsEngine:
    def __init__(self):
        pass

    def evaluate_overall_month(
        self,
        gate_closure_cutoff: str = "11:00",
        start_day: int = 1,
        end_day: int = 31
    ) -> OverallMetricsResponse:
        """
        Computes comprehensive statistical and quantitative accuracy metrics
        for wind generation forecasts across January 2026.
        """
        all_reconciled: List[ReconciledPeriod] = []
        daily_metrics_list: List[DailyMetric] = []

        for d in range(start_day, end_day + 1):
            date_str = f"2026-01-{d:02d}"
            periods = forecast_service.get_reconciled_day(date_str, gate_closure_cutoff)
            all_reconciled.extend(periods)
            daily_metrics_list.append(forecast_service.calculate_day_summary(periods, date_str))

        actuals = np.array([p.actual_mw for p in all_reconciled if p.actual_mw is not None])
        forecasts = np.array([p.forecast_mw for p in all_reconciled if p.actual_mw is not None])
        errors = np.array([p.error_mw for p in all_reconciled if p.error_mw is not None])
        abs_errors = np.abs(errors)
        pct_errors = np.array([abs(p.percentage_error) for p in all_reconciled if p.percentage_error is not None])

        n = len(errors)
        overall_mae = float(round(np.mean(abs_errors), 1))
        overall_rmse = float(round(np.sqrt(np.mean(errors ** 2)), 1))
        overall_mape = float(round(np.mean(pct_errors), 2))
        overall_bias = float(round(np.mean(errors), 1))

        p50_err = float(round(np.percentile(abs_errors, 50), 1))
        p90_err = float(round(np.percentile(abs_errors, 90), 1))

        corr_matrix = np.corrcoef(actuals, forecasts)
        correlation = float(round(corr_matrix[0, 1], 4)) if not np.isnan(corr_matrix[0, 1]) else 0.0

        # Hourly / Settlement Period Profile (periods 1 to 48)
        hourly_profile: List[PeriodHourlyError] = []
        for p in range(1, 49):
            p_periods = [item for item in all_reconciled if item.settlementPeriod == p]
            p_act = [item.actual_mw for item in p_periods]
            p_fc = [item.forecast_mw for item in p_periods]
            p_err = [item.error_mw for item in p_periods]
            p_abs = [item.abs_error_mw for item in p_periods]

            hour = (p - 1) // 2
            minute = "00" if (p % 2 != 0) else "30"
            hour_label = f"{hour:02d}:{minute}"

            hourly_profile.append(PeriodHourlyError(
                settlementPeriod=p,
                hourLabel=hour_label,
                mae_mw=round(float(np.mean(p_abs)), 1),
                rmse_mw=round(float(np.sqrt(np.mean(np.array(p_err) ** 2))), 1),
                bias_mw=round(float(np.mean(p_err)), 1),
                mean_actual_mw=round(float(np.mean(p_act)), 1),
                mean_forecast_mw=round(float(np.mean(p_fc)), 1)
            ))

        # Error Distribution Bins
        bins_def = [
            ("Severe Shortfall (< -2000 MW)", -99999.0, -2000.0),
            ("High Shortfall (-2000 to -1000 MW)", -2000.0, -1000.0),
            ("Moderate Shortfall (-1000 to -500 MW)", -1000.0, -500.0),
            ("Minor Shortfall (-500 to 0 MW)", -500.0, 0.0),
            ("Minor Surplus (0 to 500 MW)", 0.0, 500.0),
            ("Moderate Surplus (500 to 1000 MW)", 500.0, 1000.0),
            ("High Surplus (1000 to 2000 MW)", 1000.0, 2000.0),
            ("Severe Surplus (> 2000 MW)", 2000.0, 99999.0)
        ]

        distribution: List[ErrorDistributionBin] = []
        for label, low, high in bins_def:
            count = int(np.sum((errors >= low) & (errors < high if high < 90000 else errors <= high)))
            pct = round((count / n) * 100, 2) if n > 0 else 0.0
            distribution.append(ErrorDistributionBin(
                range_label=label,
                min_mw=low,
                max_mw=high,
                count=count,
                percentage=pct
            ))

        return OverallMetricsResponse(
            period_start=f"2026-01-{start_day:02d}",
            period_end=f"2026-01-{end_day:02d}",
            gate_closure_cutoff=gate_closure_cutoff,
            total_periods_evaluated=n,
            mae_mw=overall_mae,
            rmse_mw=overall_rmse,
            mape_pct=overall_mape,
            bias_mw=overall_bias,
            p50_abs_error_mw=p50_err,
            p90_abs_error_mw=p90_err,
            correlation_coefficient=correlation,
            daily_metrics=daily_metrics_list,
            hourly_profile=hourly_profile,
            error_distribution=distribution
        )

metrics_engine = MetricsEngine()
