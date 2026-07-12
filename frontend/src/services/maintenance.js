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

const mapToFrontend = (m) => {
  if (!m) return null;
  return {
    id: `m-${m.id}`,
    vehicleId: `v-${m.vehicle_id}`,
    description: m.description,
    cost: parseFloat(m.cost),
    status: m.active ? 'Open' : 'Closed',
    date: m.start_date
  };
};

export const getMaintenanceLogs = async () => {
  const res = await handleApiWithFallback(() => apiClient.get('/maintenance'), () => ({ data: [] }));
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(mapToFrontend);
};

export const openMaintenanceLog = async (data) => {
  const cleanVehicleId = parseInt(String(data.vehicleId).replace('v-', ''), 10);

  const body = {
    vehicle_id: cleanVehicleId,
    maintenance_type: data.type || 'Repair',
    description: data.description,
    cost: parseFloat(data.cost || 0),
    start_date: parseDateToIso(data.date),
  };
  const res = await handleApiWithFallback(() => apiClient.post('/maintenance', body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const closeMaintenanceLog = async (id, cost) => {
  const cleanId = typeof id === 'string' ? id.replace('m-', '') : id;

  const res = await handleApiWithFallback(() => apiClient.post(`/maintenance/${cleanId}/close`, {
    cost: parseFloat(cost),
    end_date: new Date().toISOString().split('T')[0]
  }), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};
