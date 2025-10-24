import { createClient } from '@/utils/supabase/client';

// Types based on our database schema
export interface Service {
  s_id: number;
  s_name: string;
  s_type: string;
  location: string;
  check_in: string;
  check_out: string;
  status: string;
  price: number;
  description?: string;
  amenities?: string[];
  rating?: number;
  admin_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  c_id: number;
  c_name: string;
  c_email: string;
  c_phone?: string;
  c_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  reservation_id: number;
  date: string;
  check_in_date?: string;
  check_out_date?: string;
  guest_count?: number;
  special_requests?: string;
  payment_status: string;
  s_id: number;
  c_id: number;
  service_type?: string;
  price: number;
  admin_id?: number;
  created_at?: string;
  updated_at?: string;
  // Joined data
  service?: Service;
  customer?: Customer;
}

export interface Admin {
  a_id: number;
  a_name: string;
  a_email: string;
  a_phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Service functions
export async function getServices() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .order('s_id', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data as Service[];
}

export async function getAvailableServices() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .eq('status', 'available')
    .order('s_id', { ascending: false });

  if (error) {
    console.error('Error fetching available services:', error);
    return [];
  }

  return data as Service[];
}

export async function getServiceById(id: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .eq('s_id', id)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    return null;
  }

  return data as Service;
}

// Add new Service
export async function createService(service: Omit<Service, 's_id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('service')
    .insert([service])
    .select('*')
    .single();

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data as Service;
}

// Customer functions
export async function getCustomers() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .order('c_id', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data as Customer[];
}

export async function createCustomer(customer: Omit<Customer, 'c_id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customer')
    .insert([customer])
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }

  return data as Customer;
}

// Reservation functions
export async function getReservations() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reservation')
    .select(`
      *,
      service:service(*),
      customer:customer(*)
    `)
    .order('reservation_id', { ascending: false });

  if (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }

  return data as Reservation[];
}

export async function createReservation(reservation: Omit<Reservation, 'reservation_id' | 'created_at' | 'updated_at' | 'service' | 'customer'>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reservation')
    .insert([reservation])
    .select(`
      *,
      service:service(*),
      customer:customer(*)
    `)
    .single();

  if (error) {
    console.error('Error creating reservation:', error);
    return null;
  }

  return data as Reservation;
}

// Admin functions
export async function getAdmins() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('admin')
    .select('*')
    .order('a_id', { ascending: false });

  if (error) {
    console.error('Error fetching admins:', error);
    return [];
  }

  return data as Admin[];
}

// Dashboard stats
export async function getDashboardStats() {
  const supabase = createClient();
  
  const [servicesResult, reservationsResult, customersResult] = await Promise.all([
    supabase.from('service').select('s_id', { count: 'exact' }),
    supabase.from('reservation').select('reservation_id', { count: 'exact' }),
    supabase.from('customer').select('c_id', { count: 'exact' })
  ]);

  return {
    totalServices: servicesResult.count || 0,
    totalReservations: reservationsResult.count || 0,
    totalCustomers: customersResult.count || 0
  };
}