import React from 'react';
import { X, BookOpen, Clock, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

export default function MethodologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">UK Day-Ahead Power Market & Forecast Methodology</h2>
              <p className="text-xs text-slate-400">Regulatory, Mathematical & Operational Context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-slate-850/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>1. The Day-Ahead Decision Gate Closure Rule</span>
            </h3>
            <p>
              In the Great Britain (GB) wholesale electricity market, power for delivery day <strong>D</strong> (consisting of 48 half-hour settlement periods from 00:00 to 23:30 UTC) is traded on power exchanges (EPEX SPOT GB and Nord Pool N2EX) on day <strong>D-1</strong>.
            </p>
            <p className="mt-2">
              The primary day-ahead auction gate closure occurs between <strong>09:20 and 11:00 UTC on D-1</strong>. Utility trading desks must submit firm power purchase orders before this deadline. Consequently, any forecast published after gate closure is commercially unusable for the primary day-ahead auction.
            </p>
            <p className="mt-2 text-cyan-400 font-mono text-[11px]">
              Latest Available Forecast Rule: For any settlement period on Day D, select WINDFOR record with max(publishTime) WHERE publishTime ≤ Cutoff(D-1).
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-slate-850/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>2. Elexon BMRS Data Provenance</span>
            </h3>
            <p>
              In strict accordance with the challenge requirements, data is sourced exclusively from Elexon BMRS (Balancing Mechanism Reporting Service):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
              <li>
                <strong className="text-white">FUELHH Stream:</strong> Half-hourly generation outturn aggregated by fuel type. We filter strictly for <code className="text-emerald-400">fuelType = "WIND"</code> and extract <code className="text-slate-200">generation</code> and <code className="text-slate-200">startTime</code>.
              </li>
              <li>
                <strong className="text-white">WINDFOR Stream:</strong> National wind generation forecasts published periodically by the National Energy System Operator (NESO). We extract <code className="text-slate-200">publishTime</code>, <code className="text-slate-200">startTime</code>, and <code className="text-slate-200">generation</code>.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-slate-850/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>3. Quantitative Error Metrics Formulation</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 font-mono text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-amber-400 block mb-1">Mean Absolute Error (MAE):</strong>
                <code>MAE = (1/N) * Σ |Forecast_t - Actual_t|</code>
                <p className="text-[10px] text-slate-500 font-sans mt-1">Direct measure of average volume uncertainty.</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-cyan-400 block mb-1">Root Mean Square Error (RMSE):</strong>
                <code>RMSE = √((1/N) * Σ (Forecast_t - Actual_t)²)</code>
                <p className="text-[10px] text-slate-500 font-sans mt-1">Penalizes large, unhedged operational shortfalls.</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-purple-400 block mb-1">Mean Bias Error (MBE):</strong>
                <code>MBE = (1/N) * Σ (Forecast_t - Actual_t)</code>
                <p className="text-[10px] text-slate-500 font-sans mt-1">Reveals systematic over/under forecasting tendencies.</p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-emerald-400 block mb-1">P90 Risk Reserve Buffer:</strong>
                <code>Buffer = 90th percentile of |Error_t|</code>
                <p className="text-[10px] text-slate-500 font-sans mt-1">Covers 90% of empirical wind shortfall scenarios.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-slate-850/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>4. Commercial Day-Ahead Procurement Decision</span>
            </h3>
            <p>
              To satisfy consumer demand without incurring severe Balancing Mechanism cashout penalties:
            </p>
            <p className="mt-1 font-mono text-emerald-400 text-[11px]">
              Net Thermal Procured (MW) = max(0, Consumer Demand - Latest Wind Forecast)
            </p>
            <p className="mt-2 text-slate-400">
              When wind generation outturns lower than forecast, the utility experiences a negative imbalance (short volume) settled at the System Buy Price (often volatile during winter peaks). The quantified P90 error margin provides traders with an empirical safety reserve to contract standby capacity.
            </p>
          </section>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition"
          >
            Close & Return to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
