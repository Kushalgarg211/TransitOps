import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Topbar({ onMenuOpen }) {
  const { user, switchRole, availableRoles } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return 'RK';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Left side: Hamburger (mobile) + search bar */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuOpen}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-white"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        {/* Search bar inside header exactly as shown in mockup */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-md border border-slate-350 bg-slate-50/50 pl-3 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-450 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-white"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Right side: User display + Role Capsule */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
          {user?.name || 'Raven K.'}
        </span>

        {/* Role Avatar Capsule triggers simulation role changes */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
          >
            <span>{user?.role || 'Dispatcher'} | {getInitials(user?.name)}</span>
            <svg className="h-3 w-3 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-20">
                <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Switch Simulation Role
                </div>
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs font-medium transition-all ${
                      user?.role === role
                        ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-400 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
