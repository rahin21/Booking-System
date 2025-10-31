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
  images?: string[];
  thumbnail_url?: string;
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
  check_in_date: string;
  check_out_date: string;
  payment_status: string;
  s_id: number;
  c_id: number;
  service_type: string;
  price: number;
  admin_id?: number;
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

export async function createCustomer(customerData: Omit<Customer, 'c_id'>) {
  const supabase = createClient();
  
  try {
    console.log('Creating customer with data:', customerData);
    
    // First check if customer already exists by email
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customer')
      .select('*')
      .eq('c_email', customerData.c_email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing customer:', checkError);
      throw checkError;
    }
    
    if (existingCustomer) {
      console.log('Customer already exists, returning existing customer:', existingCustomer);
      return existingCustomer as Customer;
    }
    
    const { data, error } = await supabase
      .from('customer')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    console.log('Customer created successfully:', data);
    return data as Customer;
  } catch (error) {
    console.error('Error in createCustomer function:', error);
    throw error;
  }
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

export async function createReservation(reservationData: Omit<Reservation, 'reservation_id'>) {
  const supabase = createClient();
  
  try {
    console.log('Creating reservation with data:', reservationData);
    
    // Validate required fields
    if (!reservationData.c_id || !reservationData.s_id) {
      throw new Error('Customer ID and Service ID are required');
    }
    
    if (!reservationData.check_in_date || !reservationData.check_out_date) {
      throw new Error('Check-in and check-out dates are required');
    }
    
    const { data, error } = await supabase
      .from('reservation')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      console.error('Reservation data that failed:', reservationData);
      throw error;
    }

    console.log('Reservation created successfully:', data);
    return data as Reservation;
  } catch (error) {
    console.error('Error in createReservation function:', error);
    throw error;
  }
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
  
  try {
    const [servicesResult, customersResult, reservationsResult] = await Promise.all([
      supabase.from('service').select('*', { count: 'exact' }),
      supabase.from('customer').select('*', { count: 'exact' }),
      supabase.from('reservation').select('*', { count: 'exact' })
    ]);

    return {
      totalServices: servicesResult.count || 0,
      totalCustomers: customersResult.count || 0,
      totalReservations: reservationsResult.count || 0,
      totalRevenue: 0 // You can calculate this based on your business logic
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// UPDATE functions
export async function updateService(id: number, serviceData: Partial<Service>) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('service')
      .update(serviceData)
      .eq('s_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw error;
    }

    return data as Service;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export async function updateCustomer(id: number, customerData: Partial<Customer>) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('customer')
      .update(customerData)
      .eq('c_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    return data as Customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

export async function updateReservation(id: number, reservationData: Partial<Reservation>) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('reservation')
      .update(reservationData)
      .eq('reservation_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }

    return data as Reservation;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
}

export async function updateAdmin(id: number, adminData: Partial<Admin>) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('admin')
      .update(adminData)
      .eq('a_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin:', error);
      throw error;
    }

    return data as Admin;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
}

// DELETE functions
export async function deleteService(id: number) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('service')
      .delete()
      .eq('s_id', id);

    if (error) {
      console.error('Error deleting service:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

export async function deleteCustomer(id: number) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('customer')
      .delete()
      .eq('c_id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

export async function deleteReservation(id: number) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('reservation')
      .delete()
      .eq('reservation_id', id);

    if (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
}

export async function deleteAdmin(id: number) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('admin')
      .delete()
      .eq('a_id', id);

    if (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
}

// Filter options functions
export async function getFilterOptions() {
  const supabase = createClient();
  
  try {
    // Get unique service types
    const { data: serviceTypesData, error: serviceTypesError } = await supabase
      .from('service')
      .select('s_type')
      .eq('status', 'available');

    if (serviceTypesError) {
      console.error('Error fetching service types:', serviceTypesError);
      throw serviceTypesError;
    }

    // Get unique locations
    const { data: locationsData, error: locationsError } = await supabase
      .from('service')
      .select('location')
      .eq('status', 'available');

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      throw locationsError;
    }

    // Get price range (min and max prices)
    const { data: priceData, error: priceError } = await supabase
      .from('service')
      .select('price')
      .eq('status', 'available')
      .order('price', { ascending: true });

    if (priceError) {
      console.error('Error fetching prices:', priceError);
      throw priceError;
    }

    // Extract unique values
    const uniqueServiceTypes = [...new Set(serviceTypesData?.map(item => item.s_type) || [])];
    const uniqueLocations = [...new Set(locationsData?.map(item => item.location) || [])];
    
    // Calculate price ranges based on actual data
    const prices = priceData?.map(item => item.price) || [];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Generate dynamic price ranges
    const priceRanges = generatePriceRanges(minPrice, maxPrice);

    return {
      serviceTypes: ['All Types', ...uniqueServiceTypes],
      locations: ['All Locations', ...uniqueLocations],
      priceRanges: ['All Prices', ...priceRanges]
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    // Return fallback options
    return {
      serviceTypes: ['All Types'],
      locations: ['All Locations'],
      priceRanges: ['All Prices']
    };
  }
}

// Helper function to generate price ranges based on min and max prices
function generatePriceRanges(minPrice: number, maxPrice: number) {
  if (minPrice === 0 && maxPrice === 0) {
    return [];
  }

  const ranges = [];
  
  // If we have a reasonable range, create dynamic ranges
  if (maxPrice > minPrice) {
    const range = maxPrice - minPrice;
    const step = Math.ceil(range / 5); // Create 5 ranges
    
    let currentMin = minPrice;
    
    // First range: Under minimum + step
    ranges.push(`Under ৳${currentMin + step}`);
    
    // Middle ranges
    for (let i = 0; i < 4; i++) {
      const rangeMin = currentMin + (step * i);
      const rangeMax = currentMin + (step * (i + 1));
      ranges.push(`৳${rangeMin} - ৳${rangeMax}`);
    }
    
    // Last range: Over maximum - step
    ranges.push(`Over ৳${maxPrice - step}`);
  } else {
    // Fallback ranges if data is limited
    ranges.push(`Under ৳${Math.ceil(maxPrice / 2)}`);
    ranges.push(`Over ৳${Math.ceil(maxPrice / 2)}`);
  }
  
  return ranges;
}