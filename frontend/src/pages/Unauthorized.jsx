import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function Unauthorized() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-6 dark:bg-rose-500/5">
        <ShieldExclamationIcon className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Access Denied
      </h1>
      <p className="mt-4 max-w-md text-base text-slate-500 dark:text-slate-400">
        Your current role does not have the necessary permissions to access this department. Please contact your administrator or switch simulation roles in the top bar.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 hover:shadow-lg transition-all"
        >
          Return to Dashboard
        </Link>
        <Link
          to="/profile"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          Switch Role
        </Link>
      </div>
    </div>
  );
}
