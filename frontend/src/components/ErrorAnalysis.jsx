import React from 'react';
import { BarChart3, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ErrorAnalysis({ overallMetrics }) {
  if (!overallMetrics) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Computing quantitative evaluation metrics...
      </div>
    );
  }

  const {
    mae_mw,
    rmse_mw,
    mape_pct,
    bias_mw,
    p50_abs_error_mw,
    p90_abs_error_mw,
    correlation_coefficient,
    total_periods_evaluated,
    error_distribution = [],
    hourly_profile = []
  } = overallMetrics;

  // Max percentage in distribution for scaling bars
  const maxDistPct = Math.max(...error_distribution.map(d => d.percentage), 1);
  // Max MAE in hourly profile
  const maxHourlyMae = Math.max(...hourly_profile.map(h => h.mae_mw), 100);

  return (
    <div className="space-y-6 mb-6">
      {/* Statistical Summary Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span>Quantitative Forecast Error Evaluation (January 2026 Benchmark)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Mean Absolute Error</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{mae_mw} MW</span>
            <span className="text-[10px] text-slate-500 block mt-1">Average forecast deviation</span>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Root Mean Sq Error</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{rmse_mw} MW</span>
            <span className="text-[10px] text-slate-500 block mt-1">Penalizes large tail errors</span>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Mean Percentage Error</span>
            <span className="text-xl font-bold font-mono text-amber-400">{mape_pct}%</span>
            <span className="text-[10px] text-slate-500 block mt-1">Normalized to actual wind</span>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Systematic Bias (MBE)</span>
            <span className={`text-xl font-bold font-mono ${bias_mw >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {bias_mw > 0 ? '+' : ''}{bias_mw} MW
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              {bias_mw >= 0 ? 'Overforecast bias' : 'Underforecast bias'}
            </span>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">P90 Risk Safety Buffer</span>
            <span className="text-xl font-bold font-mono text-purple-400">{p90_abs_error_mw} MW</span>
            <span className="text-[10px] text-slate-500 block mt-1">90% of errors fall within this</span>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Linear Correlation</span>
            <span className="text-xl font-bold font-mono text-blue-400">{correlation_coefficient}</span>
            <span className="text-[10px] text-slate-500 block mt-1">Pearson r-coefficient</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Error Distribution & Diurnal Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Distribution Histogram */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Forecast Error Frequency Distribution</h4>
              <p className="text-xs text-slate-400">Total Settlement Periods: {total_periods_evaluated.toLocaleString()}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Forecast - Actual (MW)
            </span>
          </div>

          <div className="space-y-3">
            {error_distribution.map((bin, idx) => {
              const isShortfall = bin.min_mw < 0 && bin.max_mw <= 0;
              const isSurplus = bin.min_mw >= 0;
              const barColor = isShortfall
                ? 'bg-gradient-to-r from-red-500 to-amber-500'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500';

              return (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{bin.range_label}</span>
                    <span className="font-mono text-slate-400">
                      <strong>{bin.count}</strong> periods ({bin.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${(bin.percentage / maxDistPct) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-red-400">◄ Deficit Exposure (Need Fast Peakers)</span>
            <span className="text-emerald-400">Surplus Wind (Export / Turn Down) ►</span>
          </div>
        </div>

        {/* Diurnal Half-Hourly Profile */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Diurnal Error Profile by Settlement Period</h4>
              <p className="text-xs text-slate-400">Shows how forecast accuracy fluctuates across the 24-hour day</p>
            </div>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>

          {/* Miniature bar chart of MAE by period */}
          <div className="h-44 flex items-end space-x-1 pt-6 px-1 border-b border-slate-800">
            {hourly_profile.map((h, i) => {
              const heightFrac = (h.mae_mw / maxHourlyMae) * 100;
              const isPeakHour = (h.settlementPeriod >= 15 && h.settlementPeriod <= 19) || (h.settlementPeriod >= 33 && h.settlementPeriod <= 38);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-10 bg-slate-800 border border-slate-700 text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap font-mono text-white">
                    SP {h.settlementPeriod} ({h.hourLabel}): {h.mae_mw} MW MAE
                  </div>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isPeakHour ? 'bg-amber-400 group-hover:bg-amber-300' : 'bg-cyan-500/80 group-hover:bg-cyan-400'
                    }`}
                    style={{ height: `${heightFrac}%` }}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
            <span>00:00 (SP 1)</span>
            <span>06:00 (SP 13)</span>
            <span>12:00 (SP 25)</span>
            <span>18:00 (SP 37)</span>
            <span>23:30 (SP 48)</span>
          </div>

          <div className="mt-4 bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Trading Insight:</strong> Forecast error consistently ramps up during the morning rise (07:30–09:30 UTC) and evening peak (17:00–19:30 UTC) due to atmospheric boundary layer mixing. We recommend setting a wider thermal reserve during these specific peak periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
