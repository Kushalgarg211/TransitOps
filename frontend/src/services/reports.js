import apiClient, { handleApiWithFallback } from './api';
import { getFromDb } from './mockDb';

export const getReportMetrics = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/reports/metrics'),
    () => {
      const vehicles = getFromDb('to_vehicles') || [];
      const trips = getFromDb('to_trips') || [];
      const expenses = getFromDb('to_expenses') || [];
      const drivers = getFromDb('to_drivers') || [];

      // Financials
      const totalRevenue = trips
        .filter((t) => t.status === 'Completed' || t.status === 'Dispatched')
        .reduce((sum, t) => sum + (t.revenue || 0), 0);

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses;
      const roi = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

      // Expenses by Category
      const expenseCategories = expenses.reduce((acc, exp) => {
        const cat = exp.type || 'Other';
        acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
        return acc;
      }, {});

      const operationalCostBreakdown = Object.keys(expenseCategories).map((name) => ({
        name,
        value: expenseCategories[name],
      }));

      // Monthly fuel and cost trend (Simulated last 6 months)
      const monthlyTrends = [
        { month: 'Jan', fuelCost: 2200, maintenanceCost: 800, revenue: 15000 },
        { month: 'Feb', fuelCost: 2800, maintenanceCost: 1200, revenue: 18000 },
        { month: 'Mar', fuelCost: 3100, maintenanceCost: 400, revenue: 21000 },
        { month: 'Apr', fuelCost: 2900, maintenanceCost: 1500, revenue: 23000 },
        { month: 'May', fuelCost: 3400, maintenanceCost: 900, revenue: 26000 },
        { month: 'Jun', fuelCost: 3800, maintenanceCost: 1800, revenue: 29000 },
      ];

      // Fleet utilization calculation
      const active = vehicles.filter((v) => v.status === 'Active').length;
      const available = vehicles.filter((v) => v.status === 'Available').length;
      const inShop = vehicles.filter((v) => v.status === 'In Shop').length;
      const retired = vehicles.filter((v) => v.status === 'Retired').length;
      
      const totalActiveVehicles = vehicles.filter((v) => v.status !== 'Retired').length;
      const fleetUtilizationPct = totalActiveVehicles > 0 ? Math.round((active / totalActiveVehicles) * 100) : 0;

      // Fuel efficiency data: MPG by vehicle model
      const fuelEfficiency = vehicles
        .filter((v) => v.status !== 'Retired')
        .map((v) => {
          // Electric vehicles have simulated MPGe
          const mpg = v.fuelType === 'Electric' ? 95 : v.type === 'Semi' ? 6.5 : 15;
          return {
            name: `${v.make} (${v.plateNumber})`,
            efficiency: mpg,
            type: v.fuelType,
          };
        });

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        roi: Math.round(roi * 10) / 10,
        fleetUtilizationPct,
        counts: {
          activeVehicles: active,
          availableVehicles: available,
          vehiclesInShop: inShop,
          retiredVehicles: retired,
          driversOnDuty: drivers.filter((d) => d.status === 'On Duty').length,
          activeTrips: trips.filter((t) => t.status === 'Dispatched').length,
          pendingTrips: trips.filter((t) => t.status === 'Pending').length,
        },
        operationalCosts: operationalCostBreakdown,
        monthlyTrends,
        fuelEfficiency,
      };
    }
  );
};
