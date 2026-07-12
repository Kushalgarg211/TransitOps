import React from 'react';
import { Link } from 'react-router-dom';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6 dark:bg-amber-500/5">
        <FaceFrownIcon className="h-10 w-10" />
      </div>
      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
        404 Error
      </span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-base text-slate-500 dark:text-slate-400">
        Sorry, we couldn't find the page you're looking for. It may have been moved, renamed, or is temporarily unavailable.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 hover:shadow-lg transition-all"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
