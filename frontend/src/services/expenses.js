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

const mapToFrontend = (e) => {
  if (!e) return null;
  return {
    id: `e-${e.id}`,
    vehicleId: `v-${e.vehicle_id}`,
    type: e.expense_type,
    amount: parseFloat(e.amount),
    description: e.description,
    date: e.date
  };
};

export const getExpenses = async () => {
  const res = await handleApiWithFallback(() => apiClient.get('/expenses'), () => ({ data: [] }));
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(mapToFrontend);
};

export const createExpense = async (data) => {
  const cleanVehicleId = parseInt(String(data.vehicleId).replace('v-', ''), 10);

  const body = {
    vehicle_id: cleanVehicleId,
    expense_type: data.type,
    amount: parseFloat(data.amount),
    description: data.description,
    date: parseDateToIso(data.date),
  };
  const res = await handleApiWithFallback(() => apiClient.post('/expenses', body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};
