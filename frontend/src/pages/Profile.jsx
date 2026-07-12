import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  
  // Settings state stored in localStorage for persistence
  const [depotName, setDepotName] = useState(() => localStorage.getItem('to_depot_name') || 'Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState(() => localStorage.getItem('to_currency') || 'INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState(() => localStorage.getItem('to_distance_unit') || 'Kilometers');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('to_depot_name', depotName);
    localStorage.setItem('to_currency', currency);
    localStorage.setItem('to_distance_unit', distanceUnit);
    toast.success('General settings saved successfully.');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings & RBAC</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure global regional metrics and review system role permissions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: General Settings Form exactly matching mockup */}
        <div className="sketch-panel space-y-5 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-stone-800 pb-2">
            General
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Depot Name</label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Distance Unit</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 text-slate-700"
              >
                <option value="Kilometers">Kilometers</option>
                <option value="Miles">Miles</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-bold transition-all cursor-pointer text-center"
            >
              Save changes
            </button>
          </form>
        </div>

        {/* Right Column: RBAC grid matrix table exactly matching mockup */}
        <div className="bg-white border border-slate-300 rounded-lg p-5 dark:bg-slate-900 dark:border-slate-800 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 dark:border-stone-800 pb-2">
            Role-Based Access (RBAC)
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-center text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-stone-800">
                  <th className="py-2.5 font-bold uppercase text-slate-400 text-left">Role</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Fleet</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Drivers</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Trips</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Fuel/Exp.</th>
                  <th className="py-2.5 font-bold uppercase text-slate-400">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-stone-800">
                {/* Fleet Manager */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-stone-800/10">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white text-left">Fleet Manager</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                </tr>

                {/* Dispatcher */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-stone-800/10">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white text-left">Dispatcher</td>
                  <td className="py-3.5 text-slate-500 font-semibold italic">view</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-slate-400">--</td>
                </tr>

                {/* Safety Officer */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-stone-800/10">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white text-left">Safety Officer</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                  <td className="py-3.5 text-slate-500 font-semibold italic">view</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-slate-400">--</td>
                </tr>

                {/* Financial Analyst */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-stone-800/10">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white text-left">Financial Analyst</td>
                  <td className="py-3.5 text-slate-500 font-semibold italic">view</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-slate-400">--</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                  <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
