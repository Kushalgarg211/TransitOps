import apiClient, { handleApiWithFallback } from './api';
import { getFromDb, saveToDb } from './mockDb';

export const getDrivers = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/drivers'),
    () => getFromDb('to_drivers')
  );
};

export const getDriverById = async (id) => {
  return handleApiWithFallback(
    () => apiClient.get(`/drivers/${id}`),
    () => {
      const list = getFromDb('to_drivers');
      return list.find((d) => d.id === id);
    }
  );
};

export const createDriver = async (data) => {
  return handleApiWithFallback(
    () => apiClient.post('/drivers', data),
    () => {
      const list = getFromDb('to_drivers');
      const newDriver = {
        ...data,
        id: `d-${Date.now()}`,
        safetyScore: Number(data.safetyScore || 90),
      };
      list.unshift(newDriver);
      saveToDb('to_drivers', list);
      return newDriver;
    }
  );
};

export const updateDriver = async (id, data) => {
  return handleApiWithFallback(
    () => apiClient.put(`/drivers/${id}`, data),
    () => {
      const list = getFromDb('to_drivers');
      const index = list.findIndex((d) => d.id === id);
      if (index === -1) throw new Error('Driver not found');
      
      const updated = { ...list[index], ...data };
      list[index] = updated;
      saveToDb('to_drivers', list);
      return updated;
    }
  );
};

export const deleteDriver = async (id) => {
  return handleApiWithFallback(
    () => apiClient.delete(`/drivers/${id}`),
    () => {
      const list = getFromDb('to_drivers');
      const filtered = list.filter((d) => d.id !== id);
      saveToDb('to_drivers', filtered);
      return { success: true };
    }
  );
};
