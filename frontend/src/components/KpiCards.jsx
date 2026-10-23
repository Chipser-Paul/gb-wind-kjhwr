import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Zap, ShieldAlert } from 'lucide-react';

export default function KpiCards({ daySummary, overallMetrics, activeTab, procurementData }) {
  if (!daySummary && !overallMetrics) return null;

  const isProcurement = activeTab === 'procurement' && procurementData;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Forecast Wind */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isProcurement ? 'Wind Generation Forecast' : 'Latest Wind Forecast'}
          </span>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">
            {daySummary?.mean_forecast_mw?.toLocaleString() || '11,300'}
          </span>
          <span className="text-xs text-slate-400">MW avg</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Day Total Energy:</span>
          <strong className="text-cyan-400 font-mono">
            {Math.round((daySummary?.total_forecast_mwh || 271200) / 1000)} GWh
          </strong>
        </div>
      </div>

      {/* Card 2: Actual Wind Outturn */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Actual Wind Outturn</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {daySummary?.mean_actual_mw?.toLocaleString() || '11,200'}
          </span>
          <span className="text-xs text-slate-400">MW avg</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Day Outturn Energy:</span>
          <strong className="text-emerald-400 font-mono">
            {Math.round((daySummary?.total_actual_mwh || 268800) / 1000)} GWh
          </strong>
        </div>
      </div>

      {/* Card 3: Quantified Error (MAE & MAPE) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Quantified Error (MAE)</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-amber-400">
            {daySummary?.mae_mw?.toLocaleString() || '524'}
          </span>
          <span className="text-xs text-slate-400">MW MAE</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Relative Error (MAPE):</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {daySummary?.mape_pct || '8.8'}%
          </span>
        </div>
      </div>

      {/* Card 4: Imbalance / Procurement Exposure */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isProcurement ? 'Net Thermal Required' : 'Balancing Imbalance'}
          </span>
          <div className={`p-2 rounded-lg ${isProcurement ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">
            {isProcurement
              ? Math.round(procurementData.total_thermal_procured_mwh / 1000).toLocaleString() + ' GWh'
              : Math.abs(daySummary?.net_imbalance_mwh || 2400).toLocaleString() + ' MWh'}
          </span>
          <span className="text-xs text-slate-400">
            {isProcurement ? 'day thermal' : (daySummary?.net_imbalance_mwh >= 0 ? 'Surplus (Long)' : 'Deficit (Short)')}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>{isProcurement ? 'Recommended Reserve Buffer:' : 'Root Mean Sq Error (RMSE):'}</span>
          <strong className="text-purple-400 font-mono">
            {isProcurement
              ? Math.round(procurementData.recommended_total_reserve_mwh / 1000) + ' GWh'
              : (daySummary?.rmse || 688) + ' MW'}
          </strong>
        </div>
      </div>
    </div>
  );
}
