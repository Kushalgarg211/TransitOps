import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Vehicles from '../pages/Vehicles';
import Drivers from '../pages/Drivers';
import Trips from '../pages/Trips';
import Maintenance from '../pages/Maintenance';
import FuelExpenses from '../pages/FuelExpenses';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

// Security Guard for Route Authorization
const RoleGuard = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Main Layout Shell */}
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard available to all logged in users */}
        <Route index element={<Dashboard />} />
        
        {/* Vehicle Registry - Fleet Manager Only */}
        <Route
          path="vehicles"
          element={
            <RoleGuard allowedRoles={['Fleet Manager']}>
              <Vehicles />
            </RoleGuard>
          }
        />

        {/* Driver Management - Fleet Manager, Dispatcher, Safety Officer */}
        <Route
          path="drivers"
          element={
            <RoleGuard allowedRoles={['Fleet Manager', 'Dispatcher', 'Safety Officer']}>
              <Drivers />
            </RoleGuard>
          }
        />

        {/* Trip Management - Fleet Manager, Dispatcher */}
        <Route
          path="trips"
          element={
            <RoleGuard allowedRoles={['Fleet Manager', 'Dispatcher']}>
              <Trips />
            </RoleGuard>
          }
        />

        {/* Maintenance Logs - Fleet Manager, Safety Officer */}
        <Route
          path="maintenance"
          element={
            <RoleGuard allowedRoles={['Fleet Manager', 'Safety Officer']}>
              <Maintenance />
            </RoleGuard>
          }
        />

        {/* Fuel Logs & Expenses - Fleet Manager, Financial Analyst */}
        <Route
          path="fuel-expenses"
          element={
            <RoleGuard allowedRoles={['Fleet Manager', 'Financial Analyst']}>
              <FuelExpenses />
            </RoleGuard>
          }
        />

        {/* Reports & Analytics - Fleet Manager, Financial Analyst */}
        <Route
          path="reports"
          element={
            <RoleGuard allowedRoles={['Fleet Manager', 'Financial Analyst']}>
              <Reports />
            </RoleGuard>
          }
        />

        {/* Profile Settings available to all */}
        <Route path="profile" element={<Profile />} />
        
        {/* Error Redirects */}
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
