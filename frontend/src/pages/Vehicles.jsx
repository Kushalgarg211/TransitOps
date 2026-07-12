import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicles';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const VEHICLE_TYPES = ['Van', 'Truck', 'Mini', 'Semi'];
const STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];

export default function Vehicles() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal controls
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Queries
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle registered.');
      setAddModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated.');
      setEditModalOpen(false);
      setEditingVehicle(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle removed.');
      setDeleteId(null);
    }
  });

  const { register: regAdd, handleSubmit: handleAddSubmit, reset: resetAdd, formState: { errors: errorsAdd } } = useForm();
  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm();

  // Filters & Search
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? v.status === statusFilter : true;
      const matchesType = typeFilter ? v.type === typeFilter : true;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  const onAddSubmit = (data) => {
    const exists = vehicles.some(v => v.plateNumber.toLowerCase() === data.plateNumber.toLowerCase());
    if (exists) {
      toast.error('Registration number must be unique!');
      return;
    }
    
    createMutation.mutate({
      ...data,
      mileage: Number(data.mileage),
      acqCost: Number(data.acqCost),
      make: data.make || 'VAN-00',
    });
    resetAdd();
  };

  const onEditSubmit = (data) => {
    updateMutation.mutate({
      id: editingVehicle.id,
      data: {
        ...data,
        mileage: Number(data.mileage),
        acqCost: Number(data.acqCost),
      }
    });
  };

  const openEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditModalOpen(true);
    setTimeout(() => {
      resetEdit(vehicle);
    }, 100);
  };

  const getStatusBadge = (status) => {
    const colors = {
      Available: 'tag-pastel-green',
      'On Trip': 'tag-pastel-blue',
      'In Shop': 'tag-pastel-amber',
      Retired: 'tag-pastel-red',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold text-center w-24 tracking-wide uppercase ${colors[status] || 'tag-pastel-grey'}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Subheader and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Vehicle Registry</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add and review registered transport vehicles.</p>
        </div>
         <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded border border-amber-300/40 bg-amber-50/80 text-amber-800 hover:bg-amber-100/80 px-4 py-2 text-sm font-bold shadow-xs transition-all cursor-pointer dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
        >
          <PlusIcon className="h-4.5 w-4.5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Control panel (Search & Filters) */}
      <div className="sketch-panel p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex w-full md:w-auto gap-4 flex-wrap">
          <div>
            <option className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Type</option>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">All</option>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <option className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Status</option>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Search</label>
          <input
            type="text"
            placeholder="Search reg. no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 placeholder-slate-450 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden dark:bg-slate-900 dark:border-slate-800 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Reg. No. (Unique)</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Name/Model</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Type</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Capacity</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Odometer</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Acq. Cost (₹)</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Status</th>
                <th className="px-6 py-3 text-right font-bold uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {vehicle.plateNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      {vehicle.make}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                      {vehicle.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300 font-semibold">
                      {vehicle.capacity || '500 kg'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {(vehicle.mileage || 0).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-650 dark:text-slate-300 font-bold">
                      {(vehicle.acqCost || 0).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(vehicle)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <PencilSquareIcon className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(vehicle.id)}
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
                        >
                          <TrashIcon className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center font-medium text-slate-400">
                    No registry data matched filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Rule footer */}
      <div className="text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded p-3">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-md rounded shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-stone-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Register Vehicle</h3>
            <form onSubmit={handleAddSubmit(onAddSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Registration Plate (Unique)</label>
                <input
                  type="text"
                  {...regAdd('plateNumber', { required: true })}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="GJ01AB4521"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Name/Model</label>
                  <input
                    type="text"
                    {...regAdd('make', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="VAN-05"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select
                    {...regAdd('type', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Capacity</label>
                  <input
                    type="text"
                    {...regAdd('capacity', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="500 kg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Odometer</label>
                  <input
                    type="number"
                    {...regAdd('mileage', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="74000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    {...regAdd('acqCost', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="620000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    {...regAdd('status', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 font-bold hover:bg-slate-100 dark:bg-stone-900 dark:border-stone-850 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded border border-amber-300/40 bg-amber-50 text-amber-900 px-3 py-1.5 font-bold hover:bg-amber-100 cursor-pointer dark:bg-amber-950/40 dark:border-amber-900/30 dark:text-amber-350 dark:hover:bg-amber-950/60"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-md rounded shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-stone-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Modify Vehicle</h3>
            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Registration Plate (Unique)</label>
                <input
                  type="text"
                  {...regEdit('plateNumber', { required: true })}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Name/Model</label>
                  <input
                    type="text"
                    {...regEdit('make', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select
                    {...regEdit('type', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Capacity</label>
                  <input
                    type="text"
                    {...regEdit('capacity', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Odometer</label>
                  <input
                    type="number"
                    {...regEdit('mileage', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    {...regEdit('acqCost', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    {...regEdit('status', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingVehicle(null);
                  }}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 font-bold hover:bg-slate-100 dark:bg-stone-900 dark:border-stone-850 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded border border-amber-300/40 bg-amber-50 text-amber-900 px-3 py-1.5 font-bold hover:bg-amber-100 cursor-pointer dark:bg-amber-950/40 dark:border-amber-900/30 dark:text-amber-350 dark:hover:bg-amber-950/60"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-sm rounded bg-white dark:bg-slate-900 border border-slate-300">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase">Delete Vehicle?</h4>
            <p className="text-slate-500 mb-6 text-xs">This will remove the vehicle registry data permanently.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} className="rounded bg-rose-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-rose-500 cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
