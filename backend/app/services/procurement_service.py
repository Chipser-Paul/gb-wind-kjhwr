import math
from typing import List, Dict, Any
from app.services.forecast_service import forecast_service
from app.models.schemas import ProcurementPeriod, ProcurementSimulationResponse

class ProcurementService:
    """
    Simulates Day-Ahead power procurement decisions for a UK utility.
    
    Formula:
    Net Thermal Power to Procure (MW) = max(0, Consumer Demand - Wind Forecast)
    Post-Delivery Balancing Imbalance = Wind Actual - Wind Forecast
      - Positive Imbalance (Actual > Forecast): System Long (surplus energy sold into balancing mechanism)
      - Negative Imbalance (Actual < Forecast): System Short (deficit energy penalty, cashout risk)
    Recommended Risk Buffer = P90 Quantified Wind Forecast Error for that settlement period
    """
    
    DEMAND_PROFILES = {
        "typical_winter_weekday": {
            "name": "Standard UK Winter Weekday (Peak ~42 GW)",
            "base": 24000.0,
            "morning_peak": 12000.0,
            "evening_peak": 16000.0
        },
        "cold_snap_high_demand": {
            "name": "Cold Snap Arctic Spell (Peak ~48 GW)",
            "base": 28000.0,
            "morning_peak": 15000.0,
            "evening_peak": 19500.0
        },
        "winter_weekend": {
            "name": "Winter Weekend / Holiday (Peak ~36 GW)",
            "base": 21000.0,
            "morning_peak": 9500.0,
            "evening_peak": 13000.0
        }
    }

    def _get_consumer_demand(self, period: int, scenario_key: str = "typical_winter_weekday") -> float:
        cfg = self.DEMAND_PROFILES.get(scenario_key, self.DEMAND_PROFILES["typical_winter_weekday"])
        base = cfg["base"]
        
        # Diurnal curve modeling GB national demand profile
        # Period 1 (00:00) to 14 (07:00) is night valley
        # Period 15-20 (07:30 - 10:00) is morning ramp
        # Period 21-33 (10:30 - 16:30) is daytime plateau
        # Period 34-39 (17:00 - 19:30) is evening tea-time peak
        # Period 40-48 (20:00 - 23:30) is evening ramp down
        
        if 1 <= period <= 12:  # Night 00:00 - 06:00
            demand = base + math.sin((period / 12.0) * math.pi) * 1500
        elif 13 <= period <= 20:  # Morning peak
            t = (period - 13) / 7.0
            demand = base + (cfg["morning_peak"] * math.sin(t * math.pi))
        elif 21 <= period <= 32:  # Midday
            demand = base + 7500.0 + math.sin((period - 21) / 11.0 * math.pi) * 2000.0
        elif 33 <= period <= 40:  # Evening peak
            t = (period - 33) / 7.0
            demand = base + (cfg["evening_peak"] * math.sin(t * math.pi))
        else:  # Late evening
            demand = base + 4000.0 - ((period - 40) * 450.0)
            
        return round(demand, 1)

    def simulate_day_ahead_procurement(
        self,
        delivery_date: str,
        gate_closure_time: str = "11:00",
        scenario_key: str = "typical_winter_weekday"
    ) -> ProcurementSimulationResponse:
        """
        Runs procurement optimization for the 48 half-hour settlement periods of delivery_date.
        """
        periods_reconciled = forecast_service.get_reconciled_day(delivery_date, gate_closure_time)
        
        procurement_periods: List[ProcurementPeriod] = []
        tot_demand_mwh = 0.0
        tot_wind_fc_mwh = 0.0
        tot_thermal_proc_mwh = 0.0
        tot_wind_act_mwh = 0.0
        tot_actual_thermal_needed_mwh = 0.0
        tot_imbalance_mwh = 0.0
        tot_recommended_reserve_mwh = 0.0

        for p in periods_reconciled:
            period_num = p.settlementPeriod
            demand_mw = self._get_consumer_demand(period_num, scenario_key)
            wind_fc_mw = p.forecast_mw
            wind_act_mw = p.actual_mw if p.actual_mw is not None else wind_fc_mw
            
            # Net thermal procured day-ahead
            net_thermal_proc_mw = round(max(0.0, demand_mw - wind_fc_mw), 1)
            # Actual thermal that was truly needed
            actual_thermal_needed_mw = round(max(0.0, demand_mw - wind_act_mw), 1)
            
            # Imbalance: Wind actual - Wind forecast
            # If positive: excess wind generated -> utility is long
            # If negative: wind deficit -> utility is short, exposed to cashout penalty
            imbalance_mw = round(wind_act_mw - wind_fc_mw, 1)
            imbalance_mwh = round(imbalance_mw * 0.5, 1)
            
            # Quantified safety reserve buffer (P90 error ~ 1.28 * abs_error or baseline)
            safety_reserve_mw = round(max(350.0, p.abs_error_mw * 1.3), 1)
            
            # Risk categorization
            if abs(p.percentage_error) > 15.0 or p.abs_error_mw > 1200.0:
                risk = "HIGH"
            elif abs(p.percentage_error) > 8.0 or p.abs_error_mw > 600.0:
                risk = "MEDIUM"
            else:
                risk = "LOW"

            hour = (period_num - 1) // 2
            minute = "00" if (period_num % 2 != 0) else "30"
            hour_label = f"{hour:02d}:{minute}"

            procurement_periods.append(ProcurementPeriod(
                settlementPeriod=period_num,
                startTime=p.startTime,
                hourLabel=hour_label,
                consumer_demand_mw=demand_mw,
                wind_forecast_mw=wind_fc_mw,
                net_thermal_procured_mw=net_thermal_proc_mw,
                wind_actual_mw=wind_act_mw,
                actual_thermal_needed_mw=actual_thermal_needed_mw,
                imbalance_mw=imbalance_mw,
                imbalance_mwh=imbalance_mwh,
                recommended_safety_reserve_mw=safety_reserve_mw,
                risk_level=risk
            ))

            tot_demand_mwh += demand_mw * 0.5
            tot_wind_fc_mwh += wind_fc_mw * 0.5
            tot_thermal_proc_mwh += net_thermal_proc_mw * 0.5
            tot_wind_act_mwh += wind_act_mw * 0.5
            tot_actual_thermal_needed_mwh += actual_thermal_needed_mw * 0.5
            tot_imbalance_mwh += imbalance_mwh
            tot_recommended_reserve_mwh += safety_reserve_mw * 0.5

        accuracy_pct = round(100.0 - (abs(tot_thermal_proc_mwh - tot_actual_thermal_needed_mwh) / tot_demand_mwh * 100), 2)

        return ProcurementSimulationResponse(
            delivery_date=delivery_date,
            gate_closure_time=gate_closure_time,
            demand_scenario=self.DEMAND_PROFILES.get(scenario_key, {}).get("name", scenario_key),
            total_consumer_demand_mwh=round(tot_demand_mwh, 1),
            total_forecasted_wind_mwh=round(tot_wind_fc_mwh, 1),
            total_thermal_procured_mwh=round(tot_thermal_proc_mwh, 1),
            total_actual_wind_mwh=round(tot_wind_act_mwh, 1),
            total_actual_thermal_needed_mwh=round(tot_actual_thermal_needed_mwh, 1),
            net_energy_imbalance_mwh=round(tot_imbalance_mwh, 1),
            procurement_accuracy_pct=accuracy_pct,
            recommended_total_reserve_mwh=round(tot_recommended_reserve_mwh, 1),
            periods=procurement_periods
        )

procurement_service = ProcurementService()
