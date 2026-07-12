import apiClient, { handleApiWithFallback } from './api';
import { getFromDb, saveToDb } from './mockDb';

export const getVehicles = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/vehicles'),
    () => getFromDb('to_vehicles')
  );
};

export const getVehicleById = async (id) => {
  return handleApiWithFallback(
    () => apiClient.get(`/vehicles/${id}`),
    () => {
      const list = getFromDb('to_vehicles');
      return list.find((v) => v.id === id);
    }
  );
};

export const createVehicle = async (data) => {
  return handleApiWithFallback(
    () => apiClient.post('/vehicles', data),
    () => {
      const list = getFromDb('to_vehicles');
      const newVehicle = {
        ...data,
        id: `v-${Date.now()}`,
        mileage: Number(data.mileage || 0),
        year: Number(data.year || new Date().getFullYear()),
      };
      list.unshift(newVehicle);
      saveToDb('to_vehicles', list);
      return newVehicle;
    }
  );
};

export const updateVehicle = async (id, data) => {
  return handleApiWithFallback(
    () => apiClient.put(`/vehicles/${id}`, data),
    () => {
      const list = getFromDb('to_vehicles');
      const index = list.findIndex((v) => v.id === id);
      if (index === -1) throw new Error('Vehicle not found');
      
      const updated = { ...list[index], ...data };
      list[index] = updated;
      saveToDb('to_vehicles', list);
      return updated;
    }
  );
};

export const deleteVehicle = async (id) => {
  return handleApiWithFallback(
    () => apiClient.delete(`/vehicles/${id}`),
    () => {
      const list = getFromDb('to_vehicles');
      const filtered = list.filter((v) => v.id !== id);
      saveToDb('to_vehicles', filtered);
      return { success: true };
    }
  );
};
