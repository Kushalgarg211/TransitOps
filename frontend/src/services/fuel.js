import apiClient, { handleApiWithFallback } from './api';
import { getFromDb, saveToDb } from './mockDb';

export const getFuelLogs = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/fuel'),
    () => getFromDb('to_fuel')
  );
};

export const createFuelLog = async (data) => {
  return handleApiWithFallback(
    () => apiClient.post('/fuel', data),
    () => {
      const list = getFromDb('to_fuel');
      const newLog = {
        ...data,
        id: `f-${Date.now()}`,
        gallons: Number(data.gallons || 0),
        cost: Number(data.cost || 0),
        odometer: Number(data.odometer || 0),
        date: data.date || new Date().toISOString().split('T')[0],
      };
      list.unshift(newLog);
      saveToDb('to_fuel', list);
      
      // Update vehicle mileage
      if (newLog.vehicleId) {
        const vehicles = getFromDb('to_vehicles');
        const vIndex = vehicles.findIndex((v) => v.id === newLog.vehicleId);
        if (vIndex !== -1 && newLog.odometer > vehicles[vIndex].mileage) {
          vehicles[vIndex].mileage = newLog.odometer;
          saveToDb('to_vehicles', vehicles);
        }
        
        // Also log as an expense
        const expenses = getFromDb('to_expenses');
        expenses.unshift({
          id: `e-${Date.now()}`,
          vehicleId: newLog.vehicleId,
          type: 'Fuel',
          amount: newLog.cost,
          date: newLog.date,
          description: `Fuel Fill-up: ${newLog.gallons} units`,
        });
        saveToDb('to_expenses', expenses);
      }
      
      return newLog;
    }
  );
};
