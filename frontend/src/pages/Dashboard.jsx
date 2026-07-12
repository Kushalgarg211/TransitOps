import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReportMetrics } from '../services/reports';
import { getTrips } from '../services/trips';
import { getVehicles } from '../services/vehicles';
import { getDrivers } from '../services/drivers';

export default function Dashboard() {
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Queries
  const { data: metrics, isLoading: metricsLoading, error } = useQuery({
    queryKey: ['reportMetrics'],
    queryFn: getReportMetrics
  });
  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  });
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers
  });

  if (metricsLoading || tripsLoading || vehiclesLoading || driversLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-350 border-t-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-dashed border-rose-500 bg-rose-50/50 p-6 text-center dark:bg-rose-950/20">
        <h3 className="text-sm font-bold text-rose-600">Failed to sync dashboard logs</h3>
        <button onClick={() => window.location.reload()} className="mt-3 rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">
          Retry Sync
        </button>
      </div>
    );
  }

  const { counts, fleetUtilizationPct } = metrics;

  // 7 KPI cards precisely as depicted in dashboard mockup
  const kpis = [
    { name: 'Active Vehicles', value: counts.activeVehicles, borderColor: 'border-l-blue-500' },
    { name: 'Available Vehicles', value: counts.availableVehicles, borderColor: 'border-l-emerald-500' },
    { name: 'Vehicles In Maintenance', value: counts.vehiclesInShop, borderColor: 'border-l-amber-500' },
    { name: 'Active Trips', value: counts.activeTrips, borderColor: 'border-l-blue-500' },
    { name: 'Pending Trips', value: counts.pendingTrips, borderColor: 'border-l-slate-400' },
    { name: 'Drivers On Duty', value: counts.driversOnDuty, borderColor: 'border-l-slate-400' },
    { name: 'Fleet Utilization', value: `${fleetUtilizationPct}%`, borderColor: 'border-l-emerald-500' }
  ];

  // Table status badge mapping matching the sketch
  const getStatusBadge = (status) => {
    const styles = {
      'On Trip': 'bg-blue-600 text-white',
      Completed: 'bg-emerald-600 text-white',
      Dispatched: 'bg-blue-600 text-white',
      Draft: 'bg-slate-400 text-white',
      Cancelled: 'bg-rose-600 text-white',
      Pending: 'bg-slate-300 text-slate-700'
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-center w-20 tracking-wide uppercase ${styles[status] || 'bg-slate-400 text-white'}`}>
        {status}
      </span>
    );
  };

  // Horizontal bar percent helpers
  const totalActiveVehicles = vehicles.filter(v => v.status !== 'Retired').length || 1;
  const availablePct = Math.round((vehicles.filter(v => v.status === 'Available').length / totalActiveVehicles) * 100);
  const onTripPct = Math.round((vehicles.filter(v => v.status === 'Active').length / totalActiveVehicles) * 100);
  const inShopPct = Math.round((vehicles.filter(v => v.status === 'In Shop').length / totalActiveVehicles) * 100);
  const retiredPct = Math.round((vehicles.filter(v => v.status === 'Retired').length / vehicles.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* Filters bar directly as depicted in dashboard mockup */}
      <div className="sketch-panel py-3 px-4 flex flex-wrap gap-4 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filters</span>
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Vehicle Type</label>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All</option>
              <option value="Semi">Semi</option>
              <option value="Box Truck">Box Truck</option>
              <option value="Delivery Van">Delivery Van</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Available">Available</option>
              <option value="In Shop">In Shop</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Region</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
      </div>

      {/* 7 KPI cards row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-white border border-slate-300 rounded p-4 border-l-4 ${kpi.borderColor} dark:bg-slate-900 dark:border-slate-800 shadow-2xs`}
          >
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {kpi.name}
            </span>
            <span className="block text-2xl font-bold tracking-tight text-slate-950 dark:text-white mt-1">
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Trips Table */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            Recent Trips
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 font-bold uppercase text-slate-400">Trip</th>
                  <th className="py-2 font-bold uppercase text-slate-400">Vehicle</th>
                  <th className="py-2 font-bold uppercase text-slate-400">Driver</th>
                  <th className="py-2 font-bold uppercase text-slate-400">Status</th>
                  <th className="py-2 font-bold uppercase text-slate-400">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {trips.slice(0, 4).map((trip) => {
                  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                  const driver = drivers.find((d) => d.id === trip.driverId);

                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{trip.tripNumber}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{vehicle ? vehicle.plateNumber : '--'}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{driver ? driver.name : '--'}</td>
                      <td className="py-3">{getStatusBadge(trip.status)}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {trip.status === 'Completed' ? '--' : trip.status === 'Pending' ? 'Awaiting vehicle' : '45 min'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress bars */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            Vehicle Status Share
          </h3>
          <div className="space-y-4">
            {/* Available */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Available</span>
                <span className="text-slate-950 dark:text-white">{availablePct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${availablePct}%` }}></div>
              </div>
            </div>

            {/* On Trip */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600 dark:text-slate-300">On Trip</span>
                <span className="text-slate-950 dark:text-white">{onTripPct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${onTripPct}%` }}></div>
              </div>
            </div>

            {/* In Shop */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600 dark:text-slate-300">In Shop</span>
                <span className="text-slate-950 dark:text-white">{inShopPct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${inShopPct}%` }}></div>
              </div>
            </div>

            {/* Retired */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="text-slate-600 dark:text-slate-300">Retired</span>
                <span className="text-slate-950 dark:text-white">{retiredPct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 rounded-full" style={{ width: `${retiredPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
