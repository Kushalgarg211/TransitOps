import apiClient, { handleApiWithFallback } from './api';

const mapToFrontend = (v) => ({
  id: `v-${v.id}`,
  plateNumber: v.registration_number,
  make: v.vehicle_name,
  model: v.vehicle_model,
  type: v.vehicle_type,
  capacity: `${parseFloat(v.max_load_capacity)} kg`,
  capacityVal: parseFloat(v.max_load_capacity),
  mileage: parseFloat(v.odometer),
  acqCost: parseFloat(v.acquisition_cost),
  status: v.status === 'On Trip' ? 'Active' : v.status,
  created_at: v.created_at,
  updated_at: v.updated_at
});

const mapToBackend = (v) => ({
  registration_number: v.plateNumber,
  vehicle_name: v.make,
  vehicle_model: v.model || v.make || 'Standard',
  vehicle_type: v.type,
  max_load_capacity: parseFloat(v.capacityVal || (v.capacity ? parseFloat(v.capacity) : 0)),
  odometer: parseFloat(v.mileage || 0),
  acquisition_cost: parseFloat(v.acqCost || 0),
  status: v.status === 'Active' ? 'On Trip' : v.status
});

export const getVehicles = async () => {
  const res = await handleApiWithFallback(() => apiClient.get('/vehicles'), () => ({ data: [] }));
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(mapToFrontend);
};

export const getVehicleById = async (id) => {
  const cleanId = typeof id === 'string' ? id.replace('v-', '') : id;
  const res = await handleApiWithFallback(() => apiClient.get(`/vehicles/${cleanId}`), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const createVehicle = async (data) => {
  const body = mapToBackend(data);
  const res = await handleApiWithFallback(() => apiClient.post('/vehicles', body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const updateVehicle = async (id, data) => {
  const cleanId = typeof id === 'string' ? id.replace('v-', '') : id;
  const body = mapToBackend(data);
  const res = await handleApiWithFallback(() => apiClient.put(`/vehicles/${cleanId}`, body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const deleteVehicle = async (id) => {
  const cleanId = typeof id === 'string' ? id.replace('v-', '') : id;
  return handleApiWithFallback(() => apiClient.delete(`/vehicles/${cleanId}`), () => ({ success: true }));
};
