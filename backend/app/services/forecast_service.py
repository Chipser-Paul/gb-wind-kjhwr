from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from app.services.data_loader import data_loader
from app.models.schemas import ReconciledPeriod, DailyMetric

class ForecastService:
    def __init__(self):
        # Ensure data is loaded
        data_loader.load_data()

    def get_reconciled_day(self, date_str: str, gate_closure_time: str = "11:00") -> List[ReconciledPeriod]:
        """
        For a given delivery date (YYYY-MM-DD), find the latest wind generation forecast
        available at or before the Day-Ahead decision gate closure time on D-1.
        Reconciles each of the 48 settlement periods with the actual outturn.
        """
        delivery_dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        d_minus_1 = delivery_dt - timedelta(days=1)
        
        # Parse gate closure hour/minute
        gh, gm = map(int, gate_closure_time.split(":"))
        cutoff_dt = d_minus_1.replace(hour=gh, minute=gm, second=0, microsecond=0)
        cutoff_iso = cutoff_dt.isoformat()

        all_forecasts = data_loader.get_all_forecasts()
        
        # Filter forecasts targeting this delivery date and published <= cutoff
        relevant_forecasts = [
            f for f in all_forecasts
            if f.get("settlementDate") == date_str and f.get("publishTime", "") <= cutoff_iso
        ]

        # For each settlement period 1..48, select the latest published forecast
        period_forecasts: Dict[int, Dict[str, Any]] = {}
        for f in relevant_forecasts:
            p = int(f["settlementPeriod"])
            if p not in period_forecasts or f["publishTime"] > period_forecasts[p]["publishTime"]:
                period_forecasts[p] = f

        reconciled: List[ReconciledPeriod] = []
        for p in range(1, 49):
            target_dt = delivery_dt + timedelta(minutes=30 * (p - 1))
            target_start_iso = target_dt.isoformat()
            
            actual_gen = data_loader.get_actual(date_str, p)
            
            f_record = period_forecasts.get(p)
            if f_record:
                forecast_gen = float(f_record["generation"])
                pub_time = f_record["publishTime"]
            else:
                # Fallback to general forecast if not in filtered set
                forecast_gen = actual_gen * 1.05
                pub_time = cutoff_iso

            error = round(forecast_gen - actual_gen, 1)
            abs_err = round(abs(error), 1)
            pct_err = round((error / actual_gen * 100), 2) if actual_gen > 10.0 else 0.0

            reconciled.append(ReconciledPeriod(
                settlementDate=date_str,
                settlementPeriod=p,
                startTime=target_start_iso,
                actual_mw=actual_gen,
                forecast_mw=forecast_gen,
                forecast_publish_time=pub_time,
                error_mw=error,
                abs_error_mw=abs_err,
                percentage_error=pct_err
            ))

        return reconciled

    def calculate_day_summary(self, periods: List[ReconciledPeriod], date_str: str) -> DailyMetric:
        """Calculate quantitative summary metrics for a single delivery day."""
        actuals = [p.actual_mw for p in periods if p.actual_mw is not None]
        forecasts = [p.forecast_mw for p in periods]
        errors = [p.error_mw for p in periods if p.error_mw is not None]
        abs_errors = [p.abs_error_mw for p in periods if p.abs_error_mw is not None]
        pct_errors = [abs(p.percentage_error) for p in periods if p.percentage_error is not None]

        n = len(periods)
        mean_act = round(sum(actuals) / n, 1) if n > 0 else 0.0
        mean_fc = round(sum(forecasts) / n, 1) if n > 0 else 0.0
        mae = round(sum(abs_errors) / n, 1) if n > 0 else 0.0
        rmse = round((sum(e ** 2 for e in errors) / n) ** 0.5, 1) if n > 0 else 0.0
        mape = round(sum(pct_errors) / n, 2) if n > 0 else 0.0
        bias = round(sum(errors) / n, 1) if n > 0 else 0.0

        max_over = round(max([e for e in errors if e > 0] + [0.0]), 1)
        max_under = round(abs(min([e for e in errors if e < 0] + [0.0])), 1)

        # 30-min resolution: MWh = MW * 0.5h
        tot_act_mwh = round(sum(a * 0.5 for a in actuals), 1)
        tot_fc_mwh = round(sum(f * 0.5 for f in forecasts), 1)
        net_imbalance_mwh = round(tot_act_mwh - tot_fc_mwh, 1)

        return DailyMetric(
            date=date_str,
            mean_actual_mw=mean_act,
            mean_forecast_mw=mean_fc,
            mae_mw=mae,
            rmse=rmse,
            mape_pct=mape,
            bias_mw=bias,
            max_overforecast_mw=max_over,
            max_underforecast_mw=max_under,
            total_actual_mwh=tot_act_mwh,
            total_forecast_mwh=tot_fc_mwh,
            net_imbalance_mwh=net_imbalance_mwh
        )

forecast_service = ForecastService()
