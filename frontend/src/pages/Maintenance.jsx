import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getMaintenanceLogs, openMaintenanceLog, closeMaintenanceLog } from '../services/maintenance';
import { getVehicles } from '../services/vehicles';
import { toast } from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Maintenance() {
  const queryClient = useQueryClient();
  const { globalSearch } = useAuth();

  // Queries
  const { data: logs = [], isLoading: logsLoading } = useQuery({ queryKey: ['maintenanceLogs'], queryFn: getMaintenanceLogs });
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles });

  const filteredLogs = useMemo(() => {
    if (!globalSearch) return logs;
    const term = globalSearch.toLowerCase();
    return logs.filter((log) => {
      const vehicle = vehicles.find((v) => v.id === log.vehicleId);
      return (
        log.description?.toLowerCase().includes(term) ||
        log.status?.toLowerCase().includes(term) ||
        vehicle?.plateNumber?.toLowerCase().includes(term) ||
        vehicle?.make?.toLowerCase().includes(term)
      );
    });
  }, [logs, vehicles, globalSearch]);

  // Mutations
  const openMutation = useMutation({
    mutationFn: openMaintenanceLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Service record logged. Vehicle status moved to In Shop.');
      reset();
    }
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, cost }) => closeMaintenanceLog(id, cost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['reportMetrics'] });
      toast.success('Service log marked Completed.');
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      serviceType: 'Oil Change',
      cost: 2500,
      date: '07/07/2026',
      status: 'Active'
    }
  });

  const activeVehicles = vehicles.filter((v) => v.status !== 'Retired');

  const onSubmit = (data) => {
    // Look up selected vehicle object
    const selectedVeh = vehicles.find((v) => v.plateNumber === data.vehiclePlate);
    openMutation.mutate({
      vehicleId: selectedVeh?.id || 'v-1',
      description: data.serviceType,
      cost: Number(data.cost),
      type: 'Repair',
      date: data.date,
      status: 'Open'
    });
  };

  const handleClose = (id, cost) => {
    closeMutation.mutate({ id, cost });
  };

  const getStatusBadge = (status) => {
    return (
      <span
        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-center w-20 tracking-wide uppercase ${
          status === 'Open' ? 'tag-pastel-amber' : 'tag-pastel-green'
        }`}
      >
        {status === 'Open' ? 'In Shop' : 'Completed'}
      </span>
    );
  };

  if (logsLoading || vehiclesLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Maintenance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Log repair sheets, track garage times, and restore vehicles to available states.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Log Service Record form exactly matching mockup */}
        <div className="sketch-panel space-y-5 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-stone-800 pb-2">
            Log Service Record
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Vehicle</label>
              <select
                {...register('vehiclePlate', { required: true })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Vehicle --</option>
                {activeVehicles.map((v) => (
                  <option key={v.id} value={v.plateNumber}>{v.make} ({v.plateNumber})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Service Type</label>
              <input
                type="text"
                {...register('serviceType', { required: true })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cost (₹)</label>
              <input
                type="number"
                {...register('cost', { required: true })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Date</label>
              <input
                type="text"
                {...register('date', { required: true })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</label>
              <input
                type="text"
                {...register('status', { required: true })}
                className="w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 focus:outline-none dark:border-slate-800 dark:bg-stone-900/50 text-slate-800 dark:text-white"
                readOnly
              />
            </div>

            <button
              type="submit"
              className="w-full rounded border border-amber-300 bg-amber-100 text-amber-950 px-4 py-2 font-bold hover:bg-amber-200/85 transition-all cursor-pointer text-center dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-250 dark:hover:bg-amber-900/60"
            >
              Save
            </button>
          </form>

          {/* Status lifecycle diagram below form */}
          <div className="border-t border-slate-200 dark:border-stone-800 pt-4 text-[10px] space-y-2 font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">Available</span>
              <span className="text-slate-400">──(starting active record)──&gt;</span>
              <span className="text-amber-500 uppercase font-bold">In Shop</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-500 uppercase font-bold">In Shop</span>
              <span className="text-slate-400">──(closing record (not retired))──&gt;</span>
              <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">Available</span>
            </div>
          </div>

          <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 bg-amber-500/5 p-2 rounded border border-amber-500/10">
            Note: In Shop vehicles are removed from the dispatch pool.
          </div>
        </div>

        {/* Right Column: Service Log table exactly matching mockup */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 dark:border-stone-800 pb-2">
            Service Log
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <th className="py-2.5 font-bold uppercase text-slate-400">Vehicle</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Service</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Cost (₹)</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Status</th>
                  <th className="py-2.5 text-right font-bold uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {filteredLogs.map((log) => {
                  const vehicle = vehicles.find((v) => v.id === log.vehicleId);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-stone-800/10">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {vehicle ? vehicle.plateNumber : 'Unknown'}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                        {log.description}
                      </td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-stone-300">
                        {log.cost.toLocaleString()}
                      </td>
                      <td className="py-3">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="py-3 text-right">
                        {log.status === 'Open' ? (
                          <button
                            onClick={() => handleClose(log.id, log.cost)}
                            className="inline-flex items-center gap-0.5 rounded border border-emerald-300 bg-emerald-100 text-emerald-950 px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-200/85 cursor-pointer transition-all dark:bg-emerald-900/30 dark:border-emerald-850 dark:text-emerald-250 dark:hover:bg-emerald-900/55"
                          >
                            <CheckIcon className="h-3 w-3" />
                            Resolve Available
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
