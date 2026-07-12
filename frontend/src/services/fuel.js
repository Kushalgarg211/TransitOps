import apiClient, { handleApiWithFallback } from './api';

const parseDateToIso = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
};

const mapToFrontend = (f) => {
  if (!f) return null;
  return {
    id: `f-${f.id}`,
    vehicleId: `v-${f.vehicle_id}`,
    gallons: parseFloat(f.liters),
    cost: parseFloat(f.cost),
    date: f.date
  };
};

export const getFuelLogs = async () => {
  const res = await handleApiWithFallback(() => apiClient.get('/fuel'), () => ({ data: [] }));
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(mapToFrontend);
};

export const createFuelLog = async (data) => {
  const cleanVehicleId = parseInt(String(data.vehicleId).replace('v-', ''), 10);

  const body = {
    vehicle_id: cleanVehicleId,
    liters: parseFloat(data.gallons),
    cost: parseFloat(data.cost),
    date: parseDateToIso(data.date),
  };
  const res = await handleApiWithFallback(() => apiClient.post('/fuel', body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};
