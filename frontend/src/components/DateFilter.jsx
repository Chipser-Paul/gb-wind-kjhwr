import React from 'react';
import { Calendar, Clock, Layers } from 'lucide-react';

export default function DateFilter({
  selectedDate,
  onChangeDate,
  selectedGateClosure,
  onChangeGateClosure,
  selectedScenario,
  onChangeScenario,
  activeTab
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Delivery Day (Jan 2026):</span>
          </div>
          <select
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {Array.from({ length: 31 }, (_, i) => {
              const day = String(i + 1).padStart(2, '0');
              const dStr = `2026-01-${day}`;
              return (
                <option key={dStr} value={dStr}>
                  {dStr} (Delivery Day D)
                </option>
              );
            })}
          </select>
        </div>

        {/* Gate Closure Cutoff Time */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>D-1 Gate Closure Cutoff:</span>
          </div>
          <select
            value={selectedGateClosure}
            onChange={(e) => onChangeGateClosure(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none font-mono"
          >
            <option value="05:30">05:30 UTC (Early Morning Run)</option>
            <option value="08:30">08:30 UTC (Pre-Auction Run)</option>
            <option value="10:30">10:30 UTC (Latest Prior to EPEX/N2EX)</option>
            <option value="11:00">11:00 UTC (Official UK Day-Ahead Cutoff)</option>
            <option value="12:30">12:30 UTC (Post-Auction Update)</option>
            <option value="16:30">16:30 UTC (Intraday Evening Run)</option>
          </select>
        </div>

        {/* Demand Scenario (for Procurement Simulation) */}
        {activeTab === 'procurement' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Consumer Demand Scenario:</span>
            </div>
            <select
              value={selectedScenario}
              onChange={(e) => onChangeScenario(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="typical_winter_weekday">Standard UK Winter Weekday (42 GW Peak)</option>
              <option value="cold_snap_high_demand">Cold Snap Arctic Spell (48 GW Peak)</option>
              <option value="winter_weekend">Winter Weekend / Low Demand (36 GW Peak)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
