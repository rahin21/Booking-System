import React from 'react';
import { HomeClient } from '@/components/HomeClient';
import { createClient } from '@/utils/supabase/server';
import { getFilterOptions } from '@/lib/database';

// Transform Supabase Service data to match ResortCard interface
function transformServiceToResort(service: any) {
  return {
    id: service.s_id,
    name: service.s_name,
    type: service.s_type,
    location: service.location,
    price: service.price,
    status: service.status,
    checkIn: service.check_in,
    checkOut: service.check_out,
    amenities: service.amenities || [],
    rating: service.rating || 4.5,
    description: service.description || ''
  };
}

export default async function Home() {
  // Fetch services from Supabase using the Server Client (safe for Server Components)
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .order('s_id', { ascending: false });

  const services = error ? [] : (data || []);

  // Transform services to match the expected resort format
  const resorts = services.map(transformServiceToResort);

  // Fetch dynamic filter options
  const filterOptions = await getFilterOptions();

  return <HomeClient initialResorts={resorts} filterOptions={filterOptions} />;
}
