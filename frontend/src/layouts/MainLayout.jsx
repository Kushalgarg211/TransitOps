import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading TransitOps...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar - Desktop and Mobile wrapper */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Main content viewport */}
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
        <Topbar onMenuOpen={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto px-6 py-6 focus:outline-none">
          {/* Framer motion or standard slide layout */}
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
