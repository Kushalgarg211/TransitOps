import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReportMetrics } from '../services/reports';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function Reports() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['reportMetrics'],
    queryFn: getReportMetrics
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sketch-panel p-6 text-center text-rose-500 font-bold">
        Failed to load analytics statement sheets.
      </div>
    );
  }

  // Preloaded trend data for 7 months matching mockup bar count
  const revenueChartData = [
    { name: 'Jan', revenue: 15000 },
    { name: 'Feb', revenue: 19000 },
    { name: 'Mar', revenue: 17000 },
    { name: 'Apr', revenue: 23000 },
    { name: 'May', revenue: 21500 },
    { name: 'Jun', revenue: 27000 },
    { name: 'Jul', revenue: 25000 },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review operations financial health and ROI performance.</p>
      </div>

      {/* Row of 4 cards exactly matching mockup */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        
        {/* Fuel Efficiency */}
        <div className="bg-white border border-slate-300 rounded p-5 border-l-4 border-l-blue-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Efficiency</span>
          <span className="block text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">8.4 km/l</span>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white border border-slate-300 rounded p-5 border-l-4 border-l-emerald-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Utilization</span>
          <span className="block text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">81%</span>
        </div>

        {/* Operational Cost */}
        <div className="bg-white border border-slate-300 rounded p-5 border-l-4 border-l-amber-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Cost</span>
          <span className="block text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">34,070</span>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-white border border-slate-300 rounded p-5 border-l-4 border-l-emerald-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle ROI</span>
          <span className="block text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">14.2%</span>
        </div>

      </div>

      {/* ROI Formula display */}
      <div className="text-xs font-semibold text-slate-500 italic dark:text-slate-400">
        ROI = (Revenue – (Maintenance + Fuel)) / Acquisition Cost
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 dark:border-stone-800 pb-2">
            Monthly Revenue
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                {/* Clean blue bars as in mockup */}
                <Bar dataKey="revenue" name="Revenue" fill="#4f81bd" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Costliest Vehicles progress bars */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 dark:border-stone-800 pb-2">
            Top Costliest Vehicles
          </h3>

          <div className="space-y-6 pt-2">
            {/* TRUCK-11 */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-700 dark:text-slate-300">TRUCK-11</span>
                <span className="text-rose-500">$18,000</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-stone-800 rounded overflow-hidden">
                <div className="h-full bg-rose-500 rounded" style={{ width: '90%' }}></div>
              </div>
            </div>

            {/* MINI-03 */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-700 dark:text-slate-300">MINI-03</span>
                <span className="text-amber-500">$6,200</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-stone-800 rounded overflow-hidden">
                <div className="h-full bg-amber-500 rounded" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* VAN-05 */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className="text-slate-700 dark:text-slate-300">VAN-05</span>
                <span className="text-blue-500">$2,500</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-stone-800 rounded overflow-hidden">
                <div className="h-full bg-blue-500 rounded" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
