import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ProcurementTab({ procurementData }) {
  if (!procurementData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Simulating day-ahead wholesale procurement decisions...
      </div>
    );
  }

  const {
    delivery_date,
    gate_closure_time,
    demand_scenario,
    total_consumer_demand_mwh,
    total_forecasted_wind_mwh,
    total_thermal_procured_mwh,
    total_actual_wind_mwh,
    net_energy_imbalance_mwh,
    procurement_accuracy_pct,
    recommended_total_reserve_mwh,
    periods = []
  } = procurementData;

  return (
    <div className="space-y-6 mb-6">
      {/* Executive Decision Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 rounded-2xl p-6 backdrop-blur shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/5 pointer-events-none transform skew-x-12"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Day-Ahead Wholesale Procurement Recommendation</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Net Thermal Procurement Order for Delivery Day: {delivery_date}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Based on latest Elexon WINDFOR forecast published prior to{' '}
              <strong className="text-cyan-400 font-mono">{gate_closure_time} UTC</strong> cutoff on D-1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Thermal to Buy Day-Ahead:</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                {Math.round(total_thermal_procured_mwh / 1000).toLocaleString()} GWh
              </span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 px-4 py-3 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Quantified Risk Buffer (P90):</span>
              <span className="text-2xl font-bold font-mono text-purple-400">
                {Math.round(recommended_total_reserve_mwh / 1000).toLocaleString()} GWh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Balance Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            1. Total Consumer Demand
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {Math.round(total_consumer_demand_mwh / 1000).toLocaleString()} GWh
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Expected consumer consumption profile across all 48 settlement periods.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            2. Covered by Wind Forecast
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {Math.round(total_forecasted_wind_mwh / 1000).toLocaleString()} GWh
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Zero-marginal-cost renewable generation meeting{' '}
            <strong className="text-emerald-400">
              {Math.round((total_forecasted_wind_mwh / total_consumer_demand_mwh) * 100)}%
            </strong>{' '}
            of demand.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            3. Net Thermal Gap to Purchase
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {Math.round(total_thermal_procured_mwh / 1000).toLocaleString()} GWh
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Procured via Day-Ahead wholesale market auctions (e.g. CCGT / gas thermal units).
          </p>
        </div>
      </div>

      {/* Dispatch Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Half-Hourly Settlement Period Procurement Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Detailed thermal procurement and post-delivery cashout balancing evaluation
            </p>
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            Accuracy: {procurement_accuracy_pct}%
          </div>
        </div>

        <div className="overflow-x-auto max-h-[440px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850/80 text-slate-400 sticky top-0 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Time (UTC)</th>
                <th className="py-3 px-4">Consumer Demand</th>
                <th className="py-3 px-4">Wind Forecast</th>
                <th className="py-3 px-4">Net Thermal Procured</th>
                <th className="py-3 px-4">Wind Outturn</th>
                <th className="py-3 px-4">Balancing Imbalance</th>
                <th className="py-3 px-4">Buffer Margin</th>
                <th className="py-3 px-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {periods.map((p) => {
                const isShort = p.imbalance_mw < 0;
                return (
                  <tr key={p.settlementPeriod} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-300">SP {p.settlementPeriod}</td>
                    <td className="py-2.5 px-4 text-slate-400">{p.hourLabel}</td>
                    <td className="py-2.5 px-4 text-white">{p.consumer_demand_mw.toLocaleString()} MW</td>
                    <td className="py-2.5 px-4 text-cyan-400">{p.wind_forecast_mw.toLocaleString()} MW</td>
                    <td className="py-2.5 px-4 text-amber-400 font-bold">
                      {p.net_thermal_procured_mw.toLocaleString()} MW
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400">{p.wind_actual_mw.toLocaleString()} MW</td>
                    <td className={`py-2.5 px-4 font-semibold ${isShort ? 'text-red-400' : 'text-emerald-400'}`}>
                      {p.imbalance_mw > 0 ? '+' : ''}{p.imbalance_mw} MW ({p.imbalance_mwh} MWh)
                    </td>
                    <td className="py-2.5 px-4 text-purple-400">+{p.recommended_safety_reserve_mw} MW</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                          p.risk_level === 'HIGH'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : p.risk_level === 'MEDIUM'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {p.risk_level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
