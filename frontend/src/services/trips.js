import apiClient, { handleApiWithFallback } from './api';
import { getFromDb, saveToDb } from './mockDb';

export const getTrips = async () => {
  return handleApiWithFallback(
    () => apiClient.get('/trips'),
    () => getFromDb('to_trips')
  );
};

export const createTrip = async (data) => {
  return handleApiWithFallback(
    () => apiClient.post('/trips', data),
    () => {
      const list = getFromDb('to_trips');
      const newTrip = {
        ...data,
        id: `t-${Date.now()}`,
        tripNumber: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
        cargoWeight: Number(data.cargoWeight || 0),
        distance: Number(data.distance || 0),
        revenue: Number(data.revenue || 0),
        status: data.status || 'Pending',
        departureDate: data.departureDate || new Date().toISOString().split('T')[0],
      };
      list.unshift(newTrip);
      saveToDb('to_trips', list);
      
      // Update vehicle/driver statuses if dispatched
      if (newTrip.status === 'Dispatched') {
        updateVehicleAndDriverStatus(newTrip.vehicleId, newTrip.driverId, true);
      }
      
      return newTrip;
    }
  );
};

export const updateTripStatus = async (id, status) => {
  return handleApiWithFallback(
    () => apiClient.patch(`/trips/${id}/status`, { status }),
    () => {
      const list = getFromDb('to_trips');
      const index = list.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Trip not found');
      
      const trip = list[index];
      const oldStatus = trip.status;
      trip.status = status;
      
      // If completed or cancelled, free up driver & vehicle
      if (status === 'Completed' || status === 'Cancelled') {
        updateVehicleAndDriverStatus(trip.vehicleId, trip.driverId, false);
      } else if (status === 'Dispatched' && oldStatus === 'Pending') {
        updateVehicleAndDriverStatus(trip.vehicleId, trip.driverId, true);
      }
      
      list[index] = trip;
      saveToDb('to_trips', list);
      return trip;
    }
  );
};

// Internal utility to switch driver/vehicle status based on dispatch state
const updateVehicleAndDriverStatus = (vehicleId, driverId, isDispatched) => {
  if (vehicleId) {
    const vehicles = getFromDb('to_vehicles');
    const vIndex = vehicles.findIndex((v) => v.id === vehicleId);
    if (vIndex !== -1) {
      vehicles[vIndex].status = isDispatched ? 'Active' : 'Available';
      saveToDb('to_vehicles', vehicles);
    }
  }
  if (driverId) {
    const drivers = getFromDb('to_drivers');
    const dIndex = drivers.findIndex((d) => d.id === driverId);
    if (dIndex !== -1) {
      drivers[dIndex].status = isDispatched ? 'On Duty' : 'Off Duty';
      saveToDb('to_drivers', drivers);
    }
  }
};
