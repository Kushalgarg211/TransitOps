import apiClient, { handleApiWithFallback } from './api';

const mapToFrontend = (d) => ({
  id: `d-${d.id}`,
  name: d.name,
  licenseNumber: d.license_number,
  licenseClass: d.license_category,
  expiryDate: d.license_expiry_date,
  contact: d.contact_number,
  tripCompl: '95%',
  safetyScore: parseFloat(d.safety_score),
  status: d.status,
  safetyStatus: d.status,
  created_at: d.created_at,
  updated_at: d.updated_at
});

const mapToBackend = (d) => {
  // Map 'Off Duty' to 'Available' for backend validator and database ENUM
  let status = d.status || d.safetyStatus || 'Available';
  if (status === 'Off Duty') {
    status = 'Available';
  }

  return {
    name: d.name,
    license_number: d.licenseNumber,
    license_category: d.licenseClass,
    license_expiry_date: d.expiryDate,
    contact_number: d.contact,
    safety_score: parseFloat(d.safetyScore !== undefined && !isNaN(d.safetyScore) ? d.safetyScore : 100),
    status: status
  };
};

export const getDrivers = async () => {
  const res = await handleApiWithFallback(() => apiClient.get('/drivers'), () => ({ data: [] }));
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(mapToFrontend);
};

export const getDriverById = async (id) => {
  const cleanId = typeof id === 'string' ? id.replace('d-', '') : id;
  const res = await handleApiWithFallback(() => apiClient.get(`/drivers/${cleanId}`), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const createDriver = async (data) => {
  const body = mapToBackend(data);
  const res = await handleApiWithFallback(() => apiClient.post('/drivers', body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const updateDriver = async (id, data) => {
  const cleanId = typeof id === 'string' ? id.replace('d-', '') : id;
  const body = mapToBackend(data);
  const res = await handleApiWithFallback(() => apiClient.put(`/drivers/${cleanId}`, body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const deleteDriver = async (id) => {
  const cleanId = typeof id === 'string' ? id.replace('d-', '') : id;
  return handleApiWithFallback(() => apiClient.delete(`/drivers/${cleanId}`), () => ({ success: true }));
};

export const sendLicenseReminders = async () => {
  return handleApiWithFallback(() => apiClient.post('/drivers/reminders/license-expiry'), () => ({ success: true, results: [] }));
};
