export interface SystemSettings {
  company_name: string;
  brand_power: string;
  whatsapp_cs: string;
  taxi_base_fare_per_km: string;
  taxi_min_fare: string;
  admin_pin: string;
  lock_timeout_minutes: string;
  qris_image_url?: string;
  [key: string]: string | undefined;
}

export interface RentalPricingItem {
  id: string;
  vehicle_model: 'VinFast VF 5' | 'VinFast VF e34';
  city: 'Surabaya' | 'Sidoarjo' | string;
  duration_hours: number;
  km_limit: number;
  price: number;
  overtime_rate_per_hour: number;
  extra_km_rate: number;
}

export interface Vehicle {
  id: string;
  code: string;
  model: 'VinFast VF 5' | 'VinFast VF e34';
  plate_number: string;
  city: 'Surabaya' | 'Sidoarjo' | string;
  dedicated_driver_id?: string;
  dedicated_driver_name?: string;
  is_active: number;
  in_maintenance: number;
  notes?: string;
  created_at: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  id_card_number?: string;
  assigned_vehicle_id?: string;
  assigned_vehicle_model?: string;
  assigned_vehicle_plate?: string;
  is_active: number;
  auth_pin?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  service_type: 'rental' | 'taxi';
  city: string;
  booking_date: string;
  booking_time: string;
  vehicle_model?: string;
  vehicle_model_name?: string;
  duration_hours?: number;
  km_limit?: number;
  assigned_vehicle_id?: string;
  real_plate_number?: string;
  pickup_address: string;
  dropoff_address?: string;
  distance_km?: number;
  customer_name: string;
  customer_phone: string;
  passenger_count: number;
  notes?: string;
  total_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  booking_status: 'pending_payment' | 'confirmed' | 'driver_pending' | 'driver_ready' | 'in_progress' | 'completed' | 'cancelled';
  driver_status: 'waiting_confirmation' | 'ready' | 'unable';
  driver_confirmed_at?: string;
  driver_name?: string;
  driver_phone?: string;
  plateNumber?: string;
  created_at: string;
  paid_at?: string;
  expires_at?: string;
}

export interface AvailabilitySummary {
  city: string;
  date: string;
  inventory: Record<string, { total: number; booked: number; available: number }>;
}
