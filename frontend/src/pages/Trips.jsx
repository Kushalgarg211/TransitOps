import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getTrips, createTrip, updateTripStatus } from '../services/trips';
import { getVehicles } from '../services/vehicles';
import { getDrivers } from '../services/drivers';
import { toast } from 'react-hot-toast';
import { PlayIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const CITIES = [
  'Gandhinagar Depot',
  'Ahmedabad Hub',
  'Vatva Industrial Area',
  'Sanand Warehouse',
  'Kalol Depot',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Surat',
  'Indore',
  'Bhopal',
  'Vadodara',
  'Rajkot',
  'Mansa',
  'Vatva',
  'Sanand'
];

export default function Trips() {
  const queryClient = useQueryClient();
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [cargoWeightInput, setCargoWeightInput] = useState('');

  // Queries
  const { data: trips = [], isLoading: tripsLoading } = useQuery({ queryKey: ['trips'], queryFn: getTrips });
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles });
  const { data: drivers = [], isLoading: driversLoading } = useQuery({ queryKey: ['drivers'], queryFn: getDrivers });

  // Mutations
  const createTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Dispatch created.');
      reset();
      setSelectedVehicleId('');
      setCargoWeightInput('');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTripStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Dispatch status synced.');
    }
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      source: '',
      destination: '',
      driverId: '',
      cargoWeight: '',
      distance: '',
      revenue: ''
    }
  });

  const watchedSource = watch('source');
  const watchedDestination = watch('destination');

  React.useEffect(() => {
    if (!watchedSource || !watchedDestination) return;
    
    const s = watchedSource.trim().toLowerCase();
    const d = watchedDestination.trim().toLowerCase();
    
    if (s === d) {
      setValue('distance', '0');
      return;
    }

    const key = `${s}_to_${d}`;
    const reverseKey = `${d}_to_${s}`;
    
    const distanceMatrix = {
      'gandhinagar depot_to_ahmedabad hub': 25,
      'gandhinagar depot_to_vatva industrial area': 38,
      'gandhinagar depot_to_sanand warehouse': 45,
      'gandhinagar depot_to_kalol depot': 18,
      
      'ahmedabad hub_to_vatva industrial area': 15,
      'ahmedabad hub_to_sanand warehouse': 30,
      'ahmedabad hub_to_kalol depot': 28,
      
      'vatva industrial area_to_sanand warehouse': 35,
      'vatva industrial area_to_kalol depot': 42,
      
      'sanand warehouse_to_kalol depot': 48,
      
      'mumbai_to_delhi': 1400,
      'mumbai_to_bangalore': 1000,
      'mumbai_to_pune': 150,
      'delhi_to_kolkata': 1500,
      'bangalore_to_chennai': 350,
      'hyderabad_to_bangalore': 570
    };
    
    let dist = distanceMatrix[key] || distanceMatrix[reverseKey];
    
    if (dist) {
      setValue('distance', String(dist));
    } else {
      // Calculate deterministic hash distance for custom inputs
      let hash = 0;
      const combined = s + d;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      dist = 50 + Math.abs(hash % 450);
      setValue('distance', String(dist));
    }
  }, [watchedSource, watchedDestination, setValue]);

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'Available' || d.status === 'Off Duty');

  // Find currently selected vehicle and calculate capacity limit
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);
  const vehicleCapacityVal = selectedVehicleObj?.capacityVal || 0;
  const cargoWeightVal = Number(cargoWeightInput || 700);
  const capacityExceeded = selectedVehicleId && cargoWeightVal > vehicleCapacityVal;
  const excessWeight = cargoWeightVal - vehicleCapacityVal;

  const onSubmit = (data) => {
    if (capacityExceeded) {
      toast.error('Cannot dispatch: Payload limit exceeded!');
      return;
    }
    
    createTripMutation.mutate({
      ...data,
      vehicleId: selectedVehicleId,
      cargoWeight: Number(data.cargoWeight),
      distance: Number(data.distance),
      revenue: Number(data.cargoWeight) * 12, // Simple revenue math
      status: 'Draft',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      Draft: 'tag-pastel-grey text-slate-700',
      Dispatched: 'tag-pastel-blue text-sky-800',
      Completed: 'tag-pastel-green text-emerald-800',
      Cancelled: 'tag-pastel-red text-rose-800',
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-center tracking-wide uppercase ${colors[status] || 'tag-pastel-grey'}`}>
        {status}
      </span>
    );
  };

  if (tripsLoading || vehiclesLoading || driversLoading) {
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Trip Dispatcher</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Dispatch cargo, review load capacities, and manage live transit boards.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Create Trip form exactly matching mockup */}
        <div className="sketch-panel space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Create Trip</h3>
            
            {/* Visual Step progress pipeline */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 dark:border-stone-800 pb-4 mb-4">
              <div className="flex flex-col items-center gap-1">
                <span className="h-5 w-5 rounded-full bg-emerald-500 border border-emerald-600 flex items-center justify-center text-[10px] text-white font-bold">✓</span>
                <span className="text-[10px] font-bold text-emerald-600">Draft</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-stone-800 mx-2"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="h-5 w-5 rounded-full bg-blue-500 border border-blue-600 flex items-center justify-center text-[10px] text-white font-bold"></span>
                <span className="text-[10px] font-bold text-blue-500">Dispatched</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-stone-800 mx-2"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="h-5 w-5 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center text-[10px] text-white font-bold"></span>
                <span className="text-[10px] font-bold text-slate-400">Completed</span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-stone-800 mx-2"></div>
              <div className="flex flex-col items-center gap-1">
                <span className="h-5 w-5 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center text-[10px] text-white font-bold"></span>
                <span className="text-[10px] font-bold text-slate-400">Cancelled</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Source (Major Cities)</label>
              <input
                type="text"
                list="city-options"
                {...register('source', { required: true })}
                placeholder="Select or type city..."
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 text-slate-750 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Destination (Major Cities)</label>
              <input
                type="text"
                list="city-options"
                {...register('destination', { required: true })}
                placeholder="Select or type city..."
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-955 text-slate-755 dark:text-slate-200"
              />
            </div>

            <datalist id="city-options">
              {CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Vehicle (Available Only)</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-350"
              >
                <option value="">-- Select Available Vehicle --</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.make} ({v.plateNumber}) - {v.capacity} capacity</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Driver (Available Only)</label>
              <select
                {...register('driverId', { required: true })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-350"
              >
                <option value="">-- Select Available Driver --</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Cargo Weight (kg)</label>
                <input
                  type="number"
                  {...register('cargoWeight', { required: true })}
                  value={cargoWeightInput}
                  onChange={(e) => setCargoWeightInput(e.target.value)}
                  placeholder="700"
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-850 dark:text-white focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Planned Distance (km)</label>
                <input
                  type="number"
                  {...register('distance', { required: true })}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-955"
                />
              </div>
            </div>

            {/* Dotted Red Exceeded Capacity Warning exactly as shown in mockup */}
            {capacityExceeded && (
              <div className="border border-rose-500 rounded p-3 bg-rose-50/70 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <p className="font-bold">Vehicle Capacity: {vehicleCapacityVal} kg</p>
                <p className="font-bold">Cargo Weight: {cargoWeightVal} kg</p>
                <p className="mt-1 font-semibold">X Capacity exceeded by {excessWeight} kg – dispatch blocked</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={capacityExceeded}
                className="flex-1 rounded border border-amber-300 bg-amber-100 text-amber-950 px-4 py-2 font-bold hover:bg-amber-200/85 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-center justify-center items-center dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-250 dark:hover:bg-amber-900/60"
              >
                Dispatch {capacityExceeded && '(Disabled)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedVehicleId('');
                  setCargoWeightInput('');
                }}
                className="rounded border border-slate-300 bg-white px-4 py-2 font-semibold hover:bg-slate-100 dark:bg-stone-900 dark:border-stone-850 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Board exactly matching mockup */}
        <div className="sketch-panel space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 dark:border-stone-800 pb-2">
            Live Board
          </h3>

          <div className="space-y-3">
            {trips.map((trip) => {
              const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
              const driver = drivers.find((d) => d.id === trip.driverId);

              return (
                <div
                  key={trip.id}
                  className="border border-slate-300 rounded p-3 relative hover:bg-slate-50/50 dark:border-stone-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{trip.tripNumber}</span>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        {vehicle?.make || 'Unassigned'} / {driver?.name || 'Unassigned'}
                      </p>
                    </div>
                    {getStatusBadge(trip.status)}
                  </div>
                  
                  <div className="flex justify-between items-end mt-4 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <div>
                      {trip.source} → {trip.destination}
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      {trip.status === 'Dispatched' ? '45 min' : trip.status === 'Draft' ? 'Awaiting driver' : trip.status === 'Cancelled' ? 'Vehicle went to shop' : '--'}
                    </div>
                  </div>

                  {/* Operational controls inside Live Board cards */}
                  <div className="flex justify-end gap-1.5 mt-3 border-t border-slate-100 dark:border-stone-800 pt-2.5">
                    {trip.status === 'Draft' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: trip.id, status: 'Dispatched' })}
                        className="inline-flex items-center gap-1 rounded border border-indigo-300 bg-indigo-100 text-indigo-950 px-2 py-0.5 text-[10px] font-bold hover:bg-indigo-200/85 cursor-pointer transition-all dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-250 dark:hover:bg-indigo-900/55"
                      >
                        Dispatch
                      </button>
                    )}
                    {trip.status === 'Dispatched' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: trip.id, status: 'Completed' })}
                        className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-100 text-emerald-950 px-2 py-0.5 text-[10px] font-bold hover:bg-emerald-200/85 cursor-pointer transition-all dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-250 dark:hover:bg-emerald-900/55"
                      >
                        Complete
                      </button>
                    )}
                    {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: trip.id, status: 'Cancelled' })}
                        className="inline-flex items-center gap-1 rounded border border-rose-300 bg-rose-100 text-rose-950 px-2 py-0.5 text-[10px] font-bold hover:bg-rose-200/85 cursor-pointer transition-all dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-250 dark:hover:bg-rose-900/55"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/50 p-2.5 rounded border border-slate-200 dark:bg-stone-900 dark:border-stone-800">
            On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
          </div>
        </div>
      </div>
    </div>
  );
}
