import os
import json
import math
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Tuple
from app.config import settings

def generate_january_2026_data() -> Dict[str, Any]:
    """
    Synthesize realistic UK National Wind generation outturn (FUELHH) and 
    forecasts (WINDFOR) for January 2026 (31 days * 48 periods = 1488 periods).
    
    UK winter wind profile characteristics:
    - Base national wind capacity ~30,000 MW.
    - Weather patterns: alternating Atlantic low-pressure systems (high wind: 12k - 20k MW)
      and cold Siberian/anticyclonic ridges (low wind: 2k - 6k MW).
    - Forecast updates published multiple times daily (e.g. 03:30, 05:30, 08:30, 10:30, 12:30, 16:30, 19:30).
    - Forecast error: consists of amplitude errors (scaling), phase/timing shifts of frontal systems,
      and high-frequency noise.
    """
    random.seed(42)  # Deterministic seed for reproducible evaluation
    
    start_dt = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
    actuals: List[Dict[str, Any]] = []
    forecasts: List[Dict[str, Any]] = []
    
    # Generate 31 days
    total_periods = 31 * 48
    
    # Underlying weather regimes across January 2026 (3-5 day cycles)
    regimes = [
        # (day_start, day_end, mean_mw, amp_mw)
        (1, 4, 14500, 4000),   # New Year Atlantic gale
        (5, 8, 4800, 1800),    # Cold anticyclonic calm
        (9, 13, 16200, 4500),  # Storm Eleanor type low pressure
        (14, 18, 9500, 3200),  # Moderate westerlies
        (19, 23, 3800, 1500),  # Polar continental cold spell (dunkelflaute)
        (24, 28, 17800, 3800), # Deep Atlantic depression (peak wind)
        (29, 31, 11200, 2900), # Unsettled transitional
    ]
    
    def get_regime_params(day: int) -> Tuple[float, float]:
        for d_s, d_e, mean_mw, amp in regimes:
            if d_s <= day <= d_e:
                return mean_mw, amp
        return 10000.0, 3000.0

    # 1. Generate Actuals for all 1,488 periods
    actual_map: Dict[Tuple[str, int], float] = {}
    
    for i in range(total_periods):
        current_time = start_dt + timedelta(minutes=30 * i)
        date_str = current_time.strftime("%Y-%m-%d")
        period = (current_time.hour * 2) + (current_time.minute // 30) + 1
        day = current_time.day
        
        base_mean, base_amp = get_regime_params(day)
        
        # Diurnal thermal and synoptic wave variation
        diurnal = math.sin((period / 48.0) * 2 * math.pi - 1.2) * 1200
        synoptic = math.sin((i / 72.0) * 2 * math.pi) * base_amp
        noise = random.gauss(0, 350)
        
        gen_mw = round(max(850.0, min(24500.0, base_mean + synoptic + diurnal + noise)), 1)
        
        actual_map[(date_str, period)] = gen_mw
        actuals.append({
            "dataset": "FUELHH",
            "startTime": current_time.isoformat(),
            "settlementDate": date_str,
            "settlementPeriod": period,
            "fuelType": "WIND",
            "generation": gen_mw
        })

    # 2. Generate Forecast runs published on Day D-1 (and D-2) for each delivery day D
    # Typical NGESO publication schedule: 05:30, 08:30, 10:30, 12:30, 16:30
    publish_hours = [
        (5, 30),  # Early morning run
        (8, 30),  # Pre-morning auction run
        (10, 30), # Main Day-Ahead decision run (crucial for 11:00 EPEX/N2EX gate closure)
        (12, 30), # Post-auction afternoon update
        (16, 30)  # Evening intraday update
    ]
    
    for day_idx in range(1, 32):
        delivery_date = datetime(2026, 1, day_idx, tzinfo=timezone.utc)
        delivery_date_str = delivery_date.strftime("%Y-%m-%d")
        d_minus_1 = delivery_date - timedelta(days=1)
        
        for p_hour, p_min in publish_hours:
            publish_dt = d_minus_1.replace(hour=p_hour, minute=p_min)
            publish_time_str = publish_dt.isoformat()
            
            # Lead time accuracy: 10:30 has lower error than 05:30
            accuracy_factor = 0.85 if (p_hour, p_min) == (10, 30) else (1.1 if p_hour == 5 else 0.95)
            # Weather phase shift: weather fronts arriving 1-2 hours earlier or later than forecast
            phase_shift_periods = random.choice([-2, -1, 0, 1, 2])
            
            for p in range(1, 49):
                target_dt = delivery_date + timedelta(minutes=30 * (p - 1))
                target_time_str = target_dt.isoformat()
                
                # Fetch actual or nearby actual to simulate realistic model prediction
                target_key = (delivery_date_str, p)
                true_actual = actual_map.get(target_key, 10000.0)
                
                # Model bias (meteorological models often slightly over-predict low wind or under-predict ramp peaks)
                shifted_p = max(1, min(48, p + phase_shift_periods))
                shifted_actual = actual_map.get((delivery_date_str, shifted_p), true_actual)
                
                error_component = ((shifted_actual - true_actual) * 0.4) + random.gauss(80, 550 * accuracy_factor)
                forecast_mw = round(max(600.0, min(25000.0, true_actual + error_component)), 1)
                
                forecasts.append({
                    "dataset": "WINDFOR",
                    "publishTime": publish_time_str,
                    "startTime": target_time_str,
                    "settlementDate": delivery_date_str,
                    "settlementPeriod": p,
                    "generation": forecast_mw
                })

    return {
        "metadata": {
            "period": "January 2026",
            "settlement_periods": total_periods,
            "fuelType": "WIND",
            "source": "Elexon BMRS Synthetic High-Fidelity Dataset"
        },
        "actuals": actuals,
        "forecasts": forecasts
    }

class DataLoader:
    def __init__(self, cache_path: str = settings.DATA_CACHE_PATH):
        self.cache_path = cache_path
        self._data: Dict[str, Any] = {}
        self._actuals_lookup: Dict[Tuple[str, int], float] = {}
        self._forecasts_list: List[Dict[str, Any]] = []

    def load_data(self) -> Dict[str, Any]:
        """Loads data from disk cache or generates if not present."""
        if os.path.exists(self.cache_path):
            try:
                with open(self.cache_path, "r") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = generate_january_2026_data()
                self._save_cache()
        else:
            self._data = generate_january_2026_data()
            self._save_cache()
            
        self._build_lookups()
        return self._data

    def _save_cache(self):
        os.makedirs(os.path.dirname(self.cache_path), exist_ok=True)
        with open(self.cache_path, "w") as f:
            json.dump(self._data, f)

    def _build_lookups(self):
        self._actuals_lookup = {}
        for row in self._data.get("actuals", []):
            key = (row["settlementDate"], int(row["settlementPeriod"]))
            self._actuals_lookup[key] = float(row["generation"])
        self._forecasts_list = self._data.get("forecasts", [])

    def get_actual(self, date_str: str, period: int) -> float:
        return self._actuals_lookup.get((date_str, period), 0.0)

    def get_all_actuals(self) -> List[Dict[str, Any]]:
        return self._data.get("actuals", [])

    def get_all_forecasts(self) -> List[Dict[str, Any]]:
        return self._forecasts_list

data_loader = DataLoader()
