import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReportMetrics } from '../services/reports';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Reports() {
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-07-31');

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['reportMetrics'],
    queryFn: getReportMetrics
  });

  // Dynamic filter for trends matching date range
  const filteredTrends = useMemo(() => {
    if (!metrics?.monthlyTrends) return [];
    
    const monthMapping = {
      'May': '2026-05-15',
      'Jun': '2026-06-15',
      'Jul': '2026-07-15'
    };

    return metrics.monthlyTrends.filter(t => {
      const dateStr = monthMapping[t.name];
      if (!dateStr) return true;
      return dateStr >= startDate && dateStr <= endDate;
    });
  }, [metrics, startDate, endDate]);

  // Recalculated operational metrics based on selected dates
  const computedKPIs = useMemo(() => {
    if (!metrics) return null;
    
    let totalRevenue = 0;
    let totalFuel = 0;
    let totalMaint = 0;
    
    filteredTrends.forEach(t => {
      totalRevenue += t.revenue;
      totalFuel += t.fuelCost;
      totalMaint += t.maintenanceCost;
    });

    if (filteredTrends.length === 0) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        roi: 0,
        avgFuelEfficiency: metrics.avgFuelEfficiency,
        fleetUtilizationPct: metrics.fleetUtilizationPct,
        topCostliestVehicles: [],
        fuelEfficiency: []
      };
    }

    const totalExpenses = totalFuel + totalMaint;
    const netProfit = totalRevenue - totalExpenses;
    
    // Scale ROI based on filtered period
    const roi = metrics.roi * (filteredTrends.length / 3);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      roi,
      avgFuelEfficiency: metrics.avgFuelEfficiency,
      fleetUtilizationPct: metrics.fleetUtilizationPct,
      topCostliestVehicles: metrics.topCostliestVehicles,
      fuelEfficiency: metrics.fuelEfficiency
    };
  }, [metrics, filteredTrends]);

  // Exporters
  const handleExportCSV = () => {
    if (!computedKPIs) return;
    const csvRows = [
      ['Metric', 'Value'],
      ['Start Date', startDate],
      ['End Date', endDate],
      ['Total Revenue (INR)', computedKPIs.totalRevenue],
      ['Total Operational Expenses (INR)', computedKPIs.totalExpenses],
      ['Net Profit (INR)', computedKPIs.netProfit],
      ['Estimated CO2 Emissions (kg)', ((computedKPIs.totalExpenses * 0.45 / 90) * 2.68).toFixed(1)]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_statement_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Statement downloaded.');
  };

  const handleDownloadPDF = () => {
    if (!computedKPIs) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked! Please allow popups to download statements.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>TransitOps - Operations Statement</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #f1a80a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; }
            .dates { font-size: 12px; color: #64748b; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
            .card { border: 1px solid #cbd5e1; padding: 15px; border-radius: 4px; }
            .card-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .card-val { font-size: 20px; font-weight: bold; margin-top: 5px; }
            .footer { border-t: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TransitOps Operations Statement</div>
            <div class="dates">Billing Window: ${startDate} to ${endDate}</div>
          </div>
          <div class="grid">
            <div class="card">
              <div class="card-label">Total Revenue</div>
              <div class="card-val">₹${computedKPIs.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">Operational Cost</div>
              <div class="card-val">₹${computedKPIs.totalExpenses.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Profit</div>
              <div class="card-val">₹${computedKPIs.netProfit.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Carbon Footprint</div>
              <div class="card-val">${((computedKPIs.totalExpenses * 0.45 / 90) * 2.68).toFixed(1)} kg CO2</div>
            </div>
          </div>
          <div class="footer">
            TransitOps Compliance Audit Document • Generated Automatically on ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success('PDF Statement dispatched to printer.');
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500"></div>
      </div>
    );
  }

  if (error || !computedKPIs) {
    return (
      <div className="sketch-panel p-6 text-center text-rose-500 font-bold">
        Failed to load analytics statement sheets.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and Exporter Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review operations financial health, audit emissions, and print statements.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-stone-850 dark:bg-stone-900/60 dark:text-stone-300 cursor-pointer transition-all"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 rounded border border-amber-350 bg-amber-100 text-amber-950 hover:bg-amber-200/85 px-3 py-1.5 text-xs font-bold cursor-pointer transition-all dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-250 dark:hover:bg-amber-900/60"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Audit Filter Section */}
      <div className="sketch-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Auditing Range:</span>
        <div className="flex items-center gap-2 text-xs">
          <div>
            <label className="sr-only">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
          <span className="text-slate-400 font-bold">to</span>
          <div>
            <label className="sr-only">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950"
            />
          </div>
        </div>
      </div>

      {/* Row of 5 cards with Sustainability CO2 tracker */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        
        {/* Fuel Efficiency */}
        <div className="bg-white border border-slate-300 rounded p-4 border-l-4 border-l-blue-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Efficiency</span>
          <span className="block text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {(computedKPIs.avgFuelEfficiency || 0).toFixed(1)} km/l
          </span>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white border border-slate-300 rounded p-4 border-l-4 border-l-emerald-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Utilization</span>
          <span className="block text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {computedKPIs.fleetUtilizationPct || 0}%
          </span>
        </div>

        {/* Operational Cost */}
        <div className="bg-white border border-slate-300 rounded p-4 border-l-4 border-l-amber-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Cost</span>
          <span className="block text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            ₹{computedKPIs.totalExpenses.toLocaleString()}
          </span>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-white border border-slate-300 rounded p-4 border-l-4 border-l-violet-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle ROI</span>
          <span className="block text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {(computedKPIs.roi || 0).toFixed(1)}%
          </span>
        </div>

        {/* Carbon Footprint */}
        <div className="bg-white border border-slate-300 rounded p-4 border-l-4 border-l-rose-500 dark:bg-slate-900 dark:border-slate-800">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">CO2 Footprint</span>
          <span className="block text-xl font-bold tracking-tight text-rose-600 dark:text-rose-450 mt-1">
            {((computedKPIs.totalExpenses * 0.45 / 90) * 2.68).toFixed(1)} kg
          </span>
        </div>

      </div>

      <div className="text-[10px] font-semibold text-slate-500 italic dark:text-slate-400 bg-slate-100/40 p-2.5 rounded border border-slate-200 dark:bg-stone-900 dark:border-stone-800">
        Notes: ROI calculated on billing assets • CO2 footprint estimated at 2.68 kg CO2 per liter of fuel consumed (assuming ₹90/L average diesel pricing).
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 dark:border-stone-800 pb-2">
            Monthly Revenue Trends
          </h3>
          <div className="h-[250px] w-full">
            {filteredTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredTrends}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                  <Bar dataKey="revenue" name="Revenue" fill="#4f81bd" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-xs text-center py-24">No financial trends match the date range.</p>
            )}
          </div>
        </div>

        {/* Top Costliest Vehicles progress bars */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 dark:border-stone-800 pb-2">
            Top Costliest Vehicles
          </h3>

          <div className="space-y-6 pt-2">
            {computedKPIs.topCostliestVehicles && computedKPIs.topCostliestVehicles.length > 0 ? (
              computedKPIs.topCostliestVehicles.map((v, i) => {
                const maxCost = computedKPIs.topCostliestVehicles[0]?.cost || 1;
                const pct = maxCost > 0 ? Math.round((v.cost / maxCost) * 100) : 0;
                const colors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500'];
                const textColors = ['text-rose-500', 'text-amber-500', 'text-blue-500'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{v.name}</span>
                      <span className={textColors[i % 3]}>₹{v.cost.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-stone-800 rounded overflow-hidden">
                      <div className={`h-full ${colors[i % 3]} rounded`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-xs text-center py-6">No costliest vehicles identified.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
