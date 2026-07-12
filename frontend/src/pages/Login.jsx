import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TruckIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showErrorBox, setShowErrorBox] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: 'Raven.k@transitops.in',
      password: 'password123',
      role: 'Dispatcher'
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setShowErrorBox(false);
    try {
      // Simulate validation. If password is empty or wrong, show error.
      if (!data.password || data.password.length < 4) {
        setFailedAttempts((prev) => prev + 1);
        setShowErrorBox(true);
        setSubmitting(false);
        return;
      }
      
      // Override auth context login with chosen role
      await login(data.email, data.password);
      // Wait, our AuthContext login decides the role based on email context,
      // but the mockup has a specific ROLE (RBAC) select box!
      // Let's force the AuthContext to switch to the selected role right after login!
      // We will switch to the user's selected role directly:
      setTimeout(() => {
        // Switch to the selected role
        window.location.href = '/';
      }, 100);

      // Force context change
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.role = data.role;
        storedUser.email = data.email;
        storedUser.name = data.email.split('@')[0].replace('.', ' ');
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
    } catch (err) {
      setFailedAttempts((prev) => prev + 1);
      setShowErrorBox(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (email, role) => {
    setValue('email', email);
    setValue('password', 'password123');
    setValue('role', role);
  };

  return (
    <div className="flex min-h-screen w-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Left Panel: Dark background branding */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="space-y-6">
          {/* Logo & Headline */}
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 shadow-md">
              {/* grid icon pattern */}
              <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-slate-900 w-1.5 h-1.5 rounded-2xs"></div>
                ))}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white font-sans">TransitOps</h1>
              <p className="text-sm text-slate-400 font-sans mt-0.5">Smart Transport Operations Platform</p>
            </div>
          </div>

          {/* List of roles */}
          <div className="pt-16 space-y-4">
            <h2 className="text-lg font-bold text-slate-200">One login, four roles:</h2>
            <ul className="space-y-3 pl-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Fleet Manager
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Dispatcher
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Safety Officer
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Financial Analyst
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-500 tracking-wider font-semibold">
          TRANSITOPS © 2026 • RBAC ENABLED
        </div>
      </div>

      {/* Right Panel: White sign-in panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 relative">
          
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Role (RBAC)
                </label>
                <select
                  id="role"
                  {...register('role', { required: true })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
              </div>
            </div>

            {/* Remember & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-650 dark:text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <a href="#forgot" className="font-semibold text-blue-500 hover:text-blue-600">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md hover:bg-amber-600 transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Access Scoped details */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Access is scoped by role after login:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>• <strong className="text-slate-700 dark:text-slate-300">Fleet Manager</strong> → Fleet Registry, Maintenance Logs</li>
              <li>• <strong className="text-slate-700 dark:text-slate-300">Dispatcher</strong> → Dashboard, Trip Dispatcher</li>
              <li>• <strong className="text-slate-700 dark:text-slate-300">Safety Officer</strong> → Drivers & Safety Profiles, Compliance Logs</li>
              <li>• <strong className="text-slate-700 dark:text-slate-300">Financial Analyst</strong> → Fuel Fill-ups, Expenses, Analytics</li>
            </ul>
          </div>

          {/* Dotted Red Error Box for Demo auditing */}
          {showErrorBox && (
            <div className="absolute top-24 -right-52 w-48 border-2 border-dashed border-rose-500 rounded-lg p-3 bg-rose-50/85 text-xs text-rose-600 font-semibold shadow-md dark:bg-rose-950/20 dark:text-rose-400">
              <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500 mb-1">Error state</p>
              <p>X Invalid credentials.</p>
              <p className="mt-1 font-normal">Account locked after 5 failed attempts.</p>
            </div>
          )}

          {/* Quick simulation helper buttons for developers/reviewers */}
          <div className="block lg:hidden mt-6 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => handleQuickLogin('manager@transitops.in', 'Fleet Manager')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded">Manager</button>
              <button onClick={() => handleQuickLogin('Raven.k@transitops.in', 'Dispatcher')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded">Dispatcher</button>
              <button onClick={() => handleQuickLogin('safety@transitops.in', 'Safety Officer')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded">Safety</button>
              <button onClick={() => handleQuickLogin('finance@transitops.in', 'Financial Analyst')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 rounded">Finance</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
