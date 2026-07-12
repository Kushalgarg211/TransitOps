import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Topbar({ onMenuOpen }) {
  const { user, switchRole, availableRoles, globalSearch, setGlobalSearch } = useAuth();
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
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-white cursor-pointer transition-colors"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        {/* Search bar inside header exactly as shown in mockup */}
        <div className="relative w-full max-w-xs hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
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

        {/* Role Avatar Capsule (Static locked view based on DB credentials) */}
        <div className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs select-none">
          <span>{user?.role || 'Dispatcher'} | {getInitials(user?.name)}</span>
        </div>
      </div>
    </header>
  );
}
