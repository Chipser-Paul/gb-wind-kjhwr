import React from 'react';
import { Wind, Activity, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Navbar({ onOpenMethodology }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wind className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">Gridbricks</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                UK Day-Ahead v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Wholesale Power Procurement & Wind Forecast Intelligence</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-xs bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Data Source: <strong className="text-white">Elexon BMRS</strong></span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-400 font-mono">
              FUELHH & WINDFOR
            </div>
          </div>

          <button
            onClick={onOpenMethodology}
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition border border-slate-700/60"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Market Logic</span>
          </button>
        </div>
      </div>
    </header>
  );
}
