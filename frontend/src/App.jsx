import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DateFilter from './components/DateFilter';
import KpiCards from './components/KpiCards';
import GenerationChart from './components/GenerationChart';
import ErrorAnalysis from './components/ErrorAnalysis';
import ProcurementTab from './components/ProcurementTab';
import DailyBreakdownTable from './components/DailyBreakdownTable';
import MethodologyModal from './components/MethodologyModal';
import {
  fetchDailyForecast,
  fetchOverallMetrics,
  fetchProcurementSimulation
} from './services/api';
import { Activity, BarChart2, Flame, Table, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('forecast'); // 'forecast' | 'metrics' | 'procurement' | 'ledger'
  const [selectedDate, setSelectedDate] = useState('2026-01-15');
  const [selectedGateClosure, setSelectedGateClosure] = useState('11:00');
  const [selectedScenario, setSelectedScenario] = useState('typical_winter_weekday');
  
  const [dailyData, setDailyData] = useState(null);
  const [overallMetrics, setOverallMetrics] = useState(null);
  const [procurementData, setProcurementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Load data on param changes
  useEffect(() => {
    let isMounted = true;
    async function loadAll() {
      setLoading(true);
      try {
        const [dailyRes, metricsRes, procRes] = await Promise.all([
          fetchDailyForecast(selectedDate, selectedGateClosure),
          fetchOverallMetrics(selectedGateClosure, 1, 31),
          fetchProcurementSimulation(selectedDate, selectedGateClosure, selectedScenario)
        ]);
        if (isMounted) {
          setDailyData(dailyRes);
          setOverallMetrics(metricsRes);
          setProcurementData(procRes);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAll();
    return () => { isMounted = false; };
  }, [selectedDate, selectedGateClosure, selectedScenario]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenMethodology={() => setIsMethodologyOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('forecast')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'forecast'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Forecast vs Outturn</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'metrics'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Quantitative Accuracy</span>
            </button>

            <button
              onClick={() => setActiveTab('procurement')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'procurement'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Procurement Decision Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'ledger'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>January 2026 Ledger</span>
            </button>
          </div>

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Synchronizing calculations...</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <DateFilter
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          selectedGateClosure={selectedGateClosure}
          onChangeGateClosure={setSelectedGateClosure}
          selectedScenario={selectedScenario}
          onChangeScenario={setSelectedScenario}
          activeTab={activeTab}
        />

        {/* Key Performance Indicators */}
        <KpiCards
          daySummary={dailyData?.day_summary}
          overallMetrics={overallMetrics}
          activeTab={activeTab}
          procurementData={procurementData}
        />

        {/* Tab 1: Forecast vs Outturn */}
        {activeTab === 'forecast' && (
          <>
            <GenerationChart
              periods={dailyData?.periods || []}
              date={selectedDate}
              gateClosure={selectedGateClosure}
            />
            <DailyBreakdownTable
              dailyMetrics={overallMetrics?.daily_metrics || []}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </>
        )}

        {/* Tab 2: Quantitative Error Metrics */}
        {activeTab === 'metrics' && (
          <ErrorAnalysis overallMetrics={overallMetrics} />
        )}

        {/* Tab 3: Day-Ahead Procurement Decision Simulator */}
        {activeTab === 'procurement' && (
          <ProcurementTab procurementData={procurementData} />
        )}

        {/* Tab 4: Full Monthly Ledger */}
        {activeTab === 'ledger' && (
          <DailyBreakdownTable
            dailyMetrics={overallMetrics?.daily_metrics || []}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setActiveTab('forecast');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Gridbricks UK Power Procurement Decision Support Portal &copy; 2026</span>
          <span className="font-mono text-[11px]">Elexon BMRS Stream: FUELHH (WIND) &amp; WINDFOR</span>
        </div>
      </footer>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
