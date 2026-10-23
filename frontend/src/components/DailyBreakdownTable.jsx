import React, { useState } from 'react';
import { Calendar, ChevronRight, Download } from 'lucide-react';

export default function DailyBreakdownTable({ dailyMetrics = [], onSelectDate, selectedDate }) {
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(true);

  if (!dailyMetrics || dailyMetrics.length === 0) {
    return null;
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedList = [...dailyMetrics].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const exportCsv = () => {
    const headers = [
      'Date', 'Mean Actual MW', 'Mean Forecast MW', 'MAE MW', 'RMSE MW',
      'MAPE %', 'Bias MW', 'Actual GWh', 'Forecast GWh', 'Net Imbalance MWh'
    ];
    const rows = sortedList.map(d => [
      d.date,
      d.mean_actual_mw,
      d.mean_forecast_mw,
      d.mae_mw,
      d.rmse,
      d.mape_pct,
      d.bias_mw,
      Math.round(d.total_actual_mwh / 1000),
      Math.round(d.total_forecast_mwh / 1000),
      d.net_imbalance_mwh
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gridbricks_january_2026_wind_evaluation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur mb-6">
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>January 2026 Daily Outturn & Error Ledger (All 31 Days)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row to load its 48 settlement periods into the interactive time series
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-850/90 text-slate-400 sticky top-0 border-b border-slate-800 font-semibold uppercase tracking-wider select-none">
            <tr>
              <th onClick={() => handleSort('date')} className="py-3 px-4 cursor-pointer hover:text-white">
                Delivery Date {sortField === 'date' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('mean_actual_mw')} className="py-3 px-4 cursor-pointer hover:text-white">
                Actual Outturn {sortField === 'mean_actual_mw' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('mean_forecast_mw')} className="py-3 px-4 cursor-pointer hover:text-white">
                D-1 Forecast {sortField === 'mean_forecast_mw' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('mae_mw')} className="py-3 px-4 cursor-pointer hover:text-white">
                MAE (MW) {sortField === 'mae_mw' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('rmse')} className="py-3 px-4 cursor-pointer hover:text-white">
                RMSE (MW) {sortField === 'rmse' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('mape_pct')} className="py-3 px-4 cursor-pointer hover:text-white">
                MAPE (%) {sortField === 'mape_pct' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('bias_mw')} className="py-3 px-4 cursor-pointer hover:text-white">
                Bias {sortField === 'bias_mw' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('total_actual_mwh')} className="py-3 px-4 cursor-pointer hover:text-white">
                Day Energy {sortField === 'total_actual_mwh' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('net_imbalance_mwh')} className="py-3 px-4 cursor-pointer hover:text-white">
                Net Imbalance {sortField === 'net_imbalance_mwh' && (sortAsc ? '▲' : '▼')}
              </th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {sortedList.map((d) => {
              const isSelected = d.date === selectedDate;
              return (
                <tr
                  key={d.date}
                  onClick={() => onSelectDate(d.date)}
                  className={`cursor-pointer transition ${
                    isSelected ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold text-white flex items-center space-x-1.5">
                    <span>{d.date}</span>
                    {isSelected && <span className="text-[10px] text-emerald-400 font-sans font-semibold">Active</span>}
                  </td>
                  <td className="py-2.5 px-4 text-emerald-400">{d.mean_actual_mw.toLocaleString()} MW</td>
                  <td className="py-2.5 px-4 text-cyan-400">{d.mean_forecast_mw.toLocaleString()} MW</td>
                  <td className="py-2.5 px-4 text-amber-400 font-semibold">{d.mae_mw} MW</td>
                  <td className="py-2.5 px-4 text-slate-300">{d.rmse} MW</td>
                  <td className="py-2.5 px-4 text-slate-300">{d.mape_pct}%</td>
                  <td className={`py-2.5 px-4 ${d.bias_mw >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {d.bias_mw > 0 ? '+' : ''}{d.bias_mw} MW
                  </td>
                  <td className="py-2.5 px-4 text-white">
                    {Math.round(d.total_actual_mwh / 1000).toLocaleString()} GWh
                  </td>
                  <td className={`py-2.5 px-4 font-semibold ${d.net_imbalance_mwh >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {d.net_imbalance_mwh > 0 ? '+' : ''}{d.net_imbalance_mwh.toLocaleString()} MWh
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(d.date);
                      }}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
