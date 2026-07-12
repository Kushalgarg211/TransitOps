import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  WrenchIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const ROLE_PERMISSIONS = {
  'Fleet Manager': ['dashboard', 'fleet', 'maintenance'],
  'Dispatcher': ['dashboard', 'trips'],
  'Safety Officer': ['drivers', 'maintenance'],
  'Financial Analyst': ['fuel-expenses', 'analytics'],
  'Super User': ['dashboard', 'fleet', 'drivers', 'trips', 'maintenance', 'fuel-expenses', 'analytics', 'settings']
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const userRole = user.role || 'Fleet Manager';
  const allowedModules = ROLE_PERMISSIONS[userRole] || [];

  const navigation = [
    { name: 'Dashboard', to: '/', key: 'dashboard', icon: HomeIcon, alwaysShow: true },
    { name: 'Fleet', to: '/vehicles', key: 'fleet', icon: TruckIcon },
    { name: 'Drivers', to: '/drivers', key: 'drivers', icon: UserGroupIcon },
    { name: 'Trips', to: '/trips', key: 'trips', icon: MapIcon },
    { name: 'Maintenance', to: '/maintenance', key: 'maintenance', icon: WrenchIcon },
    { name: 'Fuel & Expenses', to: '/fuel-expenses', key: 'fuel-expenses', icon: BanknotesIcon },
    { name: 'Analytics', to: '/reports', key: 'analytics', icon: ChartBarIcon },
    { name: 'Settings', to: '/profile', key: 'settings', icon: Cog6ToothIcon, alwaysShow: true },
  ];

  const filteredNavigation = navigation.filter((item) => {
    return item.alwaysShow || allowedModules.includes(item.key);
  });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-amber-100/70 text-slate-800 border-r border-amber-200/70 transition-transform duration-300 ease-in-out flex flex-col justify-between dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-amber-200/50 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <img src="/logo1.webp" className="h-12 w-12 object-contain rounded" alt="TransitOps Logo" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              TransitOps
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-stone-400 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="mt-6 space-y-1 px-4">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 768 && onClose) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `group flex items-center px-4 py-2 text-sm font-semibold transition-all border ${
                  isActive
                    ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600/30 dark:bg-amber-950/20 dark:text-amber-400'
                    : 'border-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-amber-200/50 p-4 bg-amber-200/20 dark:border-stone-800 dark:bg-stone-950/20">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:text-stone-400 dark:hover:bg-stone-800 transition-all cursor-pointer"
        >
          <div className="flex items-center">
            {theme === 'dark' ? (
              <>
                <SunIcon className="mr-2 h-4 w-4 text-amber-400" />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <MoonIcon className="mr-2 h-4 w-4 text-indigo-400" />
                <span>Dark Theme</span>
              </>
            )}
          </div>
        </button>

        <button
          onClick={logout}
          className="mt-1 flex w-full items-center rounded px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
        >
          <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
