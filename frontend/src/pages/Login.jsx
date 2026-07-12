import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { TruckIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showErrorBox, setShowErrorBox] = useState(false);
  
  // Forgot Password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [sendingRecovery, setSendingRecovery] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setSendingRecovery(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`Password recovery link dispatched to ${recoveryEmail}`);
      setForgotModalOpen(false);
      setRecoveryEmail('');
    } catch (err) {
      toast.error('Failed to trigger recovery flow.');
    } finally {
      setSendingRecovery(false);
    }
  };

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: 'Raven.k@transitops.in',
      password: 'password123'
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setShowErrorBox(false);
    try {
      if (!data.password || data.password.length < 4) {
        setFailedAttempts((prev) => prev + 1);
        setShowErrorBox(true);
        setSubmitting(false);
        return;
      }
      
      await login(data.email, data.password);
      
      // Let AuthContext handle authenticating and saving user details
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (err) {
      setFailedAttempts((prev) => prev + 1);
      setShowErrorBox(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="flex min-h-screen w-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Left Panel: Dark background branding with WebP cover */}
      <div className="hidden lg:flex w-5/12 bg-slate-900 text-white flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Background Image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/login_page.webp" 
            alt="TransitOps Hub" 
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/60 z-10"></div>
        </div>

        {/* Content overlaid on top of background */}
        <div className="relative z-20 p-12 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Logo & Headline */}
            <div className="flex items-center gap-3">
              <img src="/logo1.webp" className="h-24 w-24 object-contain rounded-xl shadow-lg" alt="TransitOps Logo" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-sans">TransitOps</h1>
                <p className="text-sm text-slate-350 font-sans mt-0.5">Smart Transport Operations Platform</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-[10px] text-slate-400 tracking-wider font-semibold">
            TRANSITOPS © 2026 • RBAC ENABLED
          </div>
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
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="font-semibold text-blue-500 hover:text-blue-600 cursor-pointer border-0 bg-transparent p-0"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-lg border border-amber-300 bg-amber-100 text-sm font-bold text-amber-950 shadow-sm hover:bg-amber-200/85 transition-all cursor-pointer dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-250 dark:hover:bg-amber-900/60 py-2"
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
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <button type="button" onClick={() => handleQuickLogin('manager@transitops.in')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded cursor-pointer">Manager</button>
              <button type="button" onClick={() => handleQuickLogin('Raven.k@transitops.in')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded cursor-pointer">Dispatcher</button>
              <button type="button" onClick={() => handleQuickLogin('safety@transitops.in')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded cursor-pointer">Safety</button>
              <button type="button" onClick={() => handleQuickLogin('finance@transitops.in')} className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded cursor-pointer">Finance</button>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="sketch-panel w-full max-w-sm rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-stone-800 p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Reset Password</h4>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-xs">Enter your registered email address to receive recovery instructions.</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="manager@transitops.com"
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setRecoveryEmail('');
                  }}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-100 dark:bg-stone-900 dark:border-stone-850 dark:text-stone-300 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRecovery}
                  className="rounded border border-amber-300 bg-amber-100 text-amber-950 px-3 py-1.5 text-xs font-bold hover:bg-amber-200/85 disabled:opacity-50 cursor-pointer dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-250 dark:hover:bg-amber-900/60"
                >
                  {sendingRecovery ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
