import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getDrivers, createDriver, updateDriver, deleteDriver, sendLicenseReminders } from '../services/drivers';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilSquareIcon, TrashIcon, ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const LICENSE_CLASSES = ['LMV', 'HMV', 'Standard'];
const STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export default function Drivers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await sendLicenseReminders();
      toast.success(`Successfully checked expiring profiles. Alerts sent: ${res.results?.length || 0}`);
    } catch (err) {
      toast.error('Failed to trigger email reminders.');
    } finally {
      setSendingReminders(false);
    }
  };

  // Modal controls
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);

  // Queries
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver registered.');
      setAddModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDriver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated.');
      setEditModalOpen(false);
      setEditingDriver(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver removed.');
      setDeleteId(null);
    }
  });

  const { register: regAdd, handleSubmit: handleAddSubmit, reset: resetAdd, formState: { errors: errorsAdd } } = useForm();
  const { register: regEdit, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm();

  // Filters & Search
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      return (
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.contact?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [drivers, searchTerm]);

  const onAddSubmit = (data) => {
    createMutation.mutate({
      ...data,
      safetyScore: Number(data.safetyScore || 90),
      tripCompl: data.tripCompl || '90%',
      status: data.safetyStatus
    });
    resetAdd();
  };

  const onEditSubmit = (data) => {
    updateMutation.mutate({
      id: editingDriver.id,
      data: {
        ...data,
        safetyScore: Number(data.safetyScore || editingDriver.safetyScore || 90),
        status: data.safetyStatus
      }
    });
  };

  const handleToggleStatus = (newStatus) => {
    if (!selectedDriverId) {
      toast.error('Select a driver row first to toggle their status.');
      return;
    }
    const driver = drivers.find((d) => d.id === selectedDriverId);
    if (driver) {
      updateMutation.mutate({
        id: selectedDriverId,
        data: {
          ...driver,
          status: newStatus,
          safetyStatus: newStatus === 'Suspended' ? 'Suspended' : driver.safetyStatus
        }
      });
      toast.success(`Driver ${driver.name} status updated to ${newStatus}`);
    }
  };

  // License Expiry Visualizer
  const getLicenseBadge = (expiryStr) => {
    if (!expiryStr) return 'N/A';
    if (expiryStr.toLowerCase().includes('expire') || new Date(expiryStr) < new Date('2026-07-12')) {
      return (
        <span className="inline-flex items-center gap-1 text-rose-800 font-bold text-xs bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
          <ExclamationTriangleIcon className="h-3.5 w-3.5" />
          {expiryStr.includes('EXPIRE') ? expiryStr : `${expiryStr} EXPIRED`}
        </span>
      );
    }
    return <span className="text-slate-600 dark:text-slate-355 font-semibold">{expiryStr}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      Available: 'tag-pastel-green',
      'On Trip': 'tag-pastel-blue',
      'Off Duty': 'tag-pastel-grey',
      Suspended: 'tag-pastel-red',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-center w-20 tracking-wide uppercase ${colors[status] || 'tag-pastel-grey'}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-350 border-t-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header and onboard button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Drivers & Safety Profiles</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Onboard drivers, assign license classes, and inspect status logs.</p>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'Fleet Manager' || user?.role === 'Safety Officer') && (
            <button
              onClick={handleSendReminders}
              disabled={sendingReminders}
              className="inline-flex items-center justify-center gap-2 rounded border border-indigo-200/50 bg-indigo-50 text-indigo-800 hover:bg-indigo-100/80 px-4 py-2 text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              <EnvelopeIcon className="h-4.5 w-4.5" />
              <span>{sendingReminders ? 'Sending...' : 'Send Expiry Alerts'}</span>
            </button>
          )}
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded border border-amber-300/40 bg-amber-50/80 text-amber-800 hover:bg-amber-100/80 px-4 py-2 text-sm font-bold shadow-xs transition-all cursor-pointer dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
          >
            <PlusIcon className="h-4.5 w-4.5" />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="sketch-panel p-4 flex justify-between items-center">
        <div className="w-full md:w-80">
          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Search Profiles</label>
          <input
            type="text"
            placeholder="Search by Name, License or Contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 placeholder-slate-450 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
        {selectedDriverId && (
          <span className="text-xs text-amber-600 dark:text-amber-500 font-semibold animate-pulse">
            Selected Driver ID: {selectedDriverId} (Click controls below to switch status)
          </span>
        )}
      </div>

      {/* Drivers Ledger Grid */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden dark:bg-slate-900 dark:border-slate-800 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Driver</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">License No</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Category</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Expiry</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Contact</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Trip Compl.</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Safety Status</th>
                <th className="px-6 py-3 font-bold uppercase text-slate-400">Status</th>
                <th className="px-6 py-3 text-right font-bold uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/20">
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  onClick={() => setSelectedDriverId(driver.id)}
                  className={`hover:bg-slate-50/50 dark:hover:bg-stone-800/10 transition-all cursor-pointer ${
                    selectedDriverId === driver.id ? 'bg-amber-500/5 border-2 border-amber-500' : ''
                  }`}
                >
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {driver.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-600 dark:text-slate-350">
                    {driver.licenseNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                    {driver.licenseClass}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getLicenseBadge(driver.expiryDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">
                    {driver.contact || '98765xxxxx'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    {driver.tripCompl || '90%'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(driver.safetyStatus || 'Available')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(driver.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(driver);
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                      >
                        <PencilSquareIcon className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(driver.id);
                        }}
                        className="rounded p-1 text-rose-600 hover:bg-rose-50"
                      >
                        <TrashIcon className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOGGLE STAT control buttons */}
      <div className="sketch-panel p-4 space-y-3">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Toggle Stat / Status Control</span>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleToggleStatus('Available')}
            className="rounded bg-emerald-600 text-white font-semibold text-xs px-4 py-2 hover:bg-emerald-700 cursor-pointer shadow-xs"
          >
            Available
          </button>

          <button
            onClick={() => handleToggleStatus('On Trip')}
            className="rounded bg-blue-50 text-blue-800 border border-blue-200/50 hover:bg-blue-100/80 font-bold text-xs px-4 py-2 transition-all cursor-pointer dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-950/40"
          >
            On Trip
          </button>
          <button
            onClick={() => handleToggleStatus('Off Duty')}
            className="rounded bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-slate-100 font-bold text-xs px-4 py-2 transition-all cursor-pointer dark:bg-stone-900 dark:border-stone-850 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Off Duty
          </button>
          <button
            onClick={() => handleToggleStatus('Suspended')}
            className="rounded bg-rose-50 text-rose-700 border border-rose-200/50 hover:bg-rose-100 font-bold text-xs px-4 py-2 transition-all cursor-pointer dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450 dark:hover:bg-rose-950/40"
          >
            Suspended
          </button>
        </div>
      </div>

      {/* Rule alert */}
      <div className="text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded p-3">
        Rule: Expired license or Suspended status → blocked from trip assignment
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-md rounded shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Onboard Driver</h3>
            <form onSubmit={handleAddSubmit(onAddSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Driver Name</label>
                <input
                  type="text"
                  {...regAdd('name', { required: true })}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  placeholder="Alex"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">License No</label>
                  <input
                    type="text"
                    {...regAdd('licenseNumber', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="DL-88213"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">License Class</label>
                  <select
                    {...regAdd('licenseClass', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {LICENSE_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    {...regAdd('expiryDate', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Contact No</label>
                  <input
                    type="text"
                    {...regAdd('contact', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="98765xxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Trip Completion (%)</label>
                  <input
                    type="text"
                    {...regAdd('tripCompl')}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                    placeholder="96%"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Safety Status</label>
                  <select
                    {...regAdd('safetyStatus', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
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
                  Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-md rounded shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Modify Driver</h3>
            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Driver Name</label>
                <input
                  type="text"
                  {...regEdit('name', { required: true })}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">License No</label>
                  <input
                    type="text"
                    {...regEdit('licenseNumber', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">License Class</label>
                  <select
                    {...regEdit('licenseClass', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {LICENSE_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    {...regEdit('expiryDate', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Contact No</label>
                  <input
                    type="text"
                    {...regEdit('contact', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Trip Completion (%)</label>
                  <input
                    type="text"
                    {...regEdit('tripCompl')}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase mb-1">Safety Status</label>
                  <select
                    {...regEdit('safetyStatus', { required: true })}
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingDriver(null);
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-sm rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-stone-800 p-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase">Delete Driver?</h4>
            <p className="text-slate-500 mb-6 text-xs dark:text-slate-400">This will remove the driver profile record permanently.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100 dark:bg-stone-900 dark:border-stone-850 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} className="rounded border border-rose-200/50 bg-rose-50 text-rose-700 px-3 py-1.5 text-xs font-bold hover:bg-rose-100 cursor-pointer transition-all dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450 dark:hover:bg-rose-950/40">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
