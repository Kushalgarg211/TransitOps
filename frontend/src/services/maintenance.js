import apiClient, { handleApiWithFallback } from './api';
import { getFromDb, saveToDb } from './mockDb';

export const getMaintenanceLogs = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/maintenance'),
    () => getFromDb('to_maintenance')
  );
};

export const openMaintenanceLog = async (data) => {
  return handleApiWithFallback(
    () => apiClient.post('/maintenance', data),
    () => {
      const list = getFromDb('to_maintenance');
      const newLog = {
        ...data,
        id: `m-${Date.now()}`,
        cost: Number(data.cost || 0),
        status: 'Open',
        date: data.date || new Date().toISOString().split('T')[0],
      };
      list.unshift(newLog);
      saveToDb('to_maintenance', list);
      
      // Put vehicle in shop
      if (newLog.vehicleId) {
        updateVehicleStatus(newLog.vehicleId, 'In Shop');
      }
      
      return newLog;
    }
  );
};

export const closeMaintenanceLog = async (id, cost) => {
  return handleApiWithFallback(
    () => apiClient.patch(`/maintenance/${id}/close`, { cost }),
    () => {
      const list = getFromDb('to_maintenance');
      const index = list.findIndex((m) => m.id === id);
      if (index === -1) throw new Error('Maintenance log not found');
      
      const log = list[index];
      log.status = 'Closed';
      log.cost = Number(cost);
      list[index] = log;
      saveToDb('to_maintenance', list);
      
      // Update vehicle back to available
      if (log.vehicleId) {
        updateVehicleStatus(log.vehicleId, 'Available');
        
        // Also add this to expense history
        const expenses = getFromDb('to_expenses');
        expenses.unshift({
          id: `e-${Date.now()}`,
          vehicleId: log.vehicleId,
          type: 'Maintenance',
          amount: Number(cost),
          date: new Date().toISOString().split('T')[0],
          description: `Completed: ${log.description}`,
        });
        saveToDb('to_expenses', expenses);
      }
      
      return log;
    }
  );
};

const updateVehicleStatus = (vehicleId, status) => {
  const vehicles = getFromDb('to_vehicles');
  const index = vehicles.findIndex((v) => v.id === vehicleId);
  if (index !== -1) {
    vehicles[index].status = status;
    vehicles[index].lastMaintenanceDate = new Date().toISOString().split('T')[0];
    saveToDb('to_vehicles', vehicles);
  }
};
