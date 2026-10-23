import React, { useState } from 'react';

export default function GenerationChart({ periods = [], date = '', gateClosure = '11:00' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!periods || periods.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Loading settlement period time series...
      </div>
    );
  }

  // Dimensions
  const width = 1000;
  const height = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Min and max generation values
  const allValues = periods.flatMap(p => [p.actual_mw || 0, p.forecast_mw || 0]);
  const maxVal = Math.max(...allValues, 1000) * 1.15;
  const minVal = 0;

  // Scales
  const getX = (index) => padding.left + (index / (periods.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Line paths
  const actualPath = periods.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.actual_mw || 0)}`).join(' ');
  const forecastPath = periods.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.forecast_mw || 0)}`).join(' ');

  // Difference polygon path
  const diffPath = [
    ...periods.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.forecast_mw || 0)}`),
    ...periods.slice().reverse().map((p, i) => `L ${getX(periods.length - 1 - i)} ${getY(p.actual_mw || 0)}`),
    'Z'
  ].join(' ');

  const hoveredPeriod = hoveredIndex !== null ? periods[hoveredIndex] : null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6 backdrop-blur">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <span>Half-Hourly Generation Outturn vs Latest Day-Ahead Forecast</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              30-min Resolution (48 Settlement Periods)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Delivery Date: <strong className="text-white">{date}</strong> | D-1 Forecast Published Prior to <strong className="text-cyan-400 font-mono">{gateClosure} UTC</strong>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block"></span>
            <span className="text-slate-300">Actual Outturn (FUELHH)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-cyan-400 border-b border-dashed border-cyan-400 inline-block"></span>
            <span className="text-slate-300">Latest Forecast (WINDFOR)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-2 bg-amber-500/20 border border-amber-500/40 rounded inline-block"></span>
            <span className="text-slate-400">Error Spread</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
            const yVal = minVal + frac * (maxVal - minVal);
            const yPos = getY(yVal);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {Math.round(yVal).toLocaleString()} MW
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks (Every 4 periods = 2 hours) */}
          {periods.map((p, i) => {
            if (i % 4 !== 0 && i !== periods.length - 1) return null;
            const xPos = getX(i);
            const hour = Math.floor((p.settlementPeriod - 1) / 2);
            return (
              <g key={i}>
                <line
                  x1={xPos}
                  y1={padding.top + chartH}
                  x2={xPos}
                  y2={padding.top + chartH + 6}
                  stroke="#334155"
                />
                <text
                  x={xPos}
                  y={padding.top + chartH + 20}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {String(hour).padStart(2, '0')}:00
                </text>
                <text
                  x={xPos}
                  y={padding.top + chartH + 34}
                  fill="#475569"
                  fontSize="8"
                  textAnchor="middle"
                >
                  SP {p.settlementPeriod}
                </text>
              </g>
            );
          })}

          {/* Shaded difference polygon */}
          <path d={diffPath} fill="url(#errorGradient)" />

          {/* Actual generation line */}
          <path
            d={actualPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Forecast generation line */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="5 3"
            strokeLinecap="round"
          />

          {/* Interactive hover overlay */}
          {periods.map((p, i) => {
            const xPos = getX(i);
            const colWidth = chartW / periods.length;
            return (
              <rect
                key={i}
                x={xPos - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}

          {/* Hover highlight markers */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + chartH}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(periods[hoveredIndex].actual_mw || 0)}
                r="4.5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getY(periods[hoveredIndex].forecast_mw || 0)}
                r="4.5"
                fill="#06b6d4"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPeriod && (
          <div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-850/95 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-xl backdrop-blur flex items-center space-x-5 text-xs z-20 pointer-events-none"
          >
            <div>
              <span className="text-slate-400 block font-mono">
                Settlement Period {hoveredPeriod.settlementPeriod} ({hoveredPeriod.startTime.slice(11, 16)} UTC)
              </span>
              <span className="text-[10px] text-slate-500">
                Pub: {hoveredPeriod.forecast_publish_time?.slice(11, 16)} UTC
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span className="text-emerald-400 font-semibold block">
                Actual: {hoveredPeriod.actual_mw?.toLocaleString()} MW
              </span>
            </div>
            <div>
              <span className="text-cyan-400 font-semibold block">
                Forecast: {hoveredPeriod.forecast_mw?.toLocaleString()} MW
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <span
                className={`font-semibold font-mono block ${
                  hoveredPeriod.error_mw >= 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                Error: {hoveredPeriod.error_mw > 0 ? '+' : ''}{hoveredPeriod.error_mw} MW ({hoveredPeriod.percentage_error}%)
              </span>
              <span className="text-[10px] text-slate-400">
                {hoveredPeriod.error_mw >= 0 ? 'Overforecast (Deficit Risk)' : 'Underforecast (Surplus Wind)'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
