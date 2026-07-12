import apiClient, { handleApiWithFallback } from './api';

const mapToFrontend = (t) => {
  if (!t) return null;
  return {
    id: `t-${t.id}`,
    tripNumber: `TRIP-${String(t.id).padStart(3, '0')}`,
    source: t.source,
    destination: t.destination,
    vehicleId: `v-${t.vehicle_id}`,
    driverId: `d-${t.driver_id}`,
    cargoWeight: parseFloat(t.cargo_weight),
    distance: parseFloat(t.planned_distance),
    revenue: parseFloat(t.revenue),
    status: t.status === 'Pending' ? 'Draft'
          : t.status === 'On Trip' ? 'Dispatched'
          : t.status === 'Completed' ? 'Completed'
          : 'Cancelled'
  };
};

export const getTrips = async () => {
  const res = await handleApiWithFallback(() => apiClient.get('/trips'), () => ({ data: [] }));
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(mapToFrontend);
};

export const createTrip = async (data) => {
  const cleanVehicleId = parseInt(String(data.vehicleId).replace('v-', ''), 10);
  const cleanDriverId = parseInt(String(data.driverId).replace('d-', ''), 10);

  const body = {
    source: data.source,
    destination: data.destination,
    vehicle_id: cleanVehicleId,
    driver_id: cleanDriverId,
    cargo_weight: parseFloat(data.cargoWeight),
    planned_distance: parseFloat(data.distance),
    revenue: parseFloat(data.revenue)
  };
  const res = await handleApiWithFallback(() => apiClient.post('/trips', body), () => null);
  return res?.data ? mapToFrontend(res.data) : null;
};

export const updateTripStatus = async (id, status) => {
  const cleanId = typeof id === 'string' ? id.replace('t-', '') : id;

  if (status === 'Dispatched') {
    const res = await handleApiWithFallback(() => apiClient.post(`/trips/${cleanId}/dispatch`), () => null);
    return res?.data ? mapToFrontend(res.data) : null;
  } else if (status === 'Cancelled') {
    const res = await handleApiWithFallback(() => apiClient.post(`/trips/${cleanId}/cancel`), () => null);
    return res?.data ? mapToFrontend(res.data) : null;
  } else if (status === 'Completed') {
    const tripRes = await handleApiWithFallback(() => apiClient.get(`/trips/${cleanId}`), () => null);
    const trip = tripRes?.data;
    if (!trip) return null;
    
    const distance = parseFloat(trip.planned_distance) || 0;
    const fuel = Math.round(distance * 0.3) || 10;
    const startOdometer = parseFloat(trip.start_odometer) || 0;
    const endOdometer = startOdometer + distance;

    const res = await handleApiWithFallback(() => apiClient.post(`/trips/${cleanId}/complete`, {
      actual_distance: distance,
      fuel_used: fuel,
      end_odometer: endOdometer
    }), () => null);
    return res?.data ? mapToFrontend(res.data) : null;
  }
};
