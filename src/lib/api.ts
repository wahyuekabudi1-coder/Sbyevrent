import { AvailabilitySummary, RentalPricingItem, SystemSettings } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const api = {
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/api/settings`);
    const json = await res.json();
    return json.data;
  },

  async getPricing(): Promise<RentalPricingItem[]> {
    const res = await fetch(`${API_BASE}/api/pricing`);
    const json = await res.json();
    return json.data;
  },

  async getFleetModels() {
    const res = await fetch('/api/fleet-models');
    const json = await res.json();
    return json;
  },

  async getAvailability(city: string, date: string): Promise<AvailabilitySummary> {
    const res = await fetch(`${API_BASE}/api/availability?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal memeriksa ketersediaan armada');
    }
    return json;
  },

  async createRentalBooking(payload: {
    city: string;
    date: string;
    time: string;
    vehicleModel: string;
    durationHours: number;
    customerName: string;
    customerPhone: string;
    passengerCount: number;
    pickupAddress: string;
    dropoffAddress?: string;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/bookings/rental`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal membuat booking rental');
    }
    return json.data;
  },

  async createTaxiBooking(payload: {
    city: string;
    pickupAddress: string;
    dropoffAddress: string;
    pickupCoords?: { lat: number; lng: number };
    dropoffCoords?: { lat: number; lng: number };
    distanceKm: number;
    bookingDate?: string;
    bookingTime?: string;
    customerName: string;
    customerPhone: string;
    passengerCount?: number;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/bookings/taxi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal memesan taksi');
    }
    return json.data;
  },

  async getPaymentDetails(bookingNumber: string) {
    const res = await fetch(`${API_BASE}/api/payment/${bookingNumber}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal memuat info pembayaran');
    }
    return json.booking;
  },

  async processPayment(payload: { bookingNumber: string; paymentMethod: string; transactionRef?: string }) {
    const res = await fetch(`${API_BASE}/api/payment/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Gagal memproses pembayaran');
    }
    return json.data;
  },

  async trackBooking(bookingNumber: string) {
    const res = await fetch(`${API_BASE}/api/bookings/track/${bookingNumber}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Nomor booking tidak ditemukan');
    }
    return json.booking;
  },

  // Admin APIs
  async getAdminOverview(adminPin: string) {
    const res = await fetch(`${API_BASE}/api/admin/overview`, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Akses ditolak');
    return json.stats;
  },

  async getAdminVehicles(adminPin: string) {
    const res = await fetch(`${API_BASE}/api/admin/vehicles`, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  },

  async addAdminVehicle(adminPin: string, data: any) {
    const res = await fetch(`${API_BASE}/api/admin/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async updateAdminVehicle(adminPin: string, id: string, data: any) {
    const res = await fetch(`${API_BASE}/api/admin/vehicles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async deleteAdminVehicle(adminPin: string, id: string) {
    const res = await fetch(`${API_BASE}/api/admin/vehicles/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async getAdminModelImages(adminPin: string) {
    const res = await fetch('/api/admin/models/images', {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  },

  async updateAdminModelImage(adminPin: string, model: string, imageUrl: string) {
    const res = await fetch('/api/admin/models/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify({ model, imageUrl }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async resetAdminModelImage(adminPin: string, model: string) {
    const res = await fetch('/api/admin/models/image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify({ model }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async getAdminDrivers(adminPin: string) {
    const res = await fetch(`${API_BASE}/api/admin/drivers`, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  },

  async addAdminDriver(adminPin: string, data: any) {
    const res = await fetch(`${API_BASE}/api/admin/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async updateAdminDriver(adminPin: string, id: string, data: any) {
    const res = await fetch(`${API_BASE}/api/admin/drivers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async getAdminCalendar(adminPin: string, date: string) {
    const res = await fetch(`${API_BASE}/api/admin/calendar?date=${date}`, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async getAdminBookings(adminPin: string, filters: { search?: string; status?: string; service?: string; city?: string }) {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`${API_BASE}/api/admin/bookings?${query}`, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  },

  async updateAdminBooking(adminPin: string, id: string, data: any) {
    const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async getAdminDispatches(adminPin: string, date?: string) {
    const url = date ? `${API_BASE}/api/admin/driver-dispatch?date=${date}` : `${API_BASE}/api/admin/driver-dispatch`;
    const res = await fetch(url, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  },

  async updatePricing(adminPin: string, id: string, price: number, overtimeRate?: number, extraKmRate?: number) {
    const res = await fetch(`${API_BASE}/api/admin/pricing/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify({ id, price, overtimeRate, extraKmRate }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async updateSetting(adminPin: string, key: string, value: string) {
    const res = await fetch(`${API_BASE}/api/admin/settings/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminPin },
      body: JSON.stringify({ key, value }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  async getAdminReports(adminPin: string) {
    const res = await fetch(`${API_BASE}/api/admin/reports`, {
      headers: { 'x-admin-key': adminPin },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },

  // Driver Portal APIs
  async driverLogin(phone: string, pin: string) {
    const res = await fetch(`${API_BASE}/api/driver/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, pin }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.driver;
  },

  async getDriverTrips(driverId: string) {
    const res = await fetch(`${API_BASE}/api/driver/${driverId}/trips`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json.data;
  },

  async confirmDriverReady(bookingId: string, driverId: string, status: 'ready' | 'unable') {
    const res = await fetch(`${API_BASE}/api/driver/confirm-ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, driverId, status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    return json;
  },
};
