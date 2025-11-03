import React from 'react';
import { HomeClient } from '@/components/HomeClient';
import { createClient } from '@/utils/supabase/server';
import { getFilterOptions } from '@/lib/database';

// Transform Supabase Service data to match ResortCard interface
function normalizeImages(images: any): string[] {
  const coerceToUrl = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') {
      // If looks like JSON, try to parse
      const trimmed = val.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return coerceToUrl(parsed);
        } catch {
          return null;
        }
      }
      // If comma-separated URLs
      if (trimmed.includes(',') && !trimmed.includes('http')) {
        const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
        const firstHttp = parts.find(p => p.startsWith('http')) || null;
        return firstHttp;
      }
      return trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('/') ? trimmed : null;
    }
    if (Array.isArray(val)) {
      // Return first valid URL in array
      for (const item of val) {
        const u = coerceToUrl(item);
        if (u) return u;
      }
      return null;
    }
    if (typeof val === 'object') {
      // Common fields from upload responses
      const candidate = (val.url || val.secure_url || val.src || val.path || val.href);
      return typeof candidate === 'string' ? candidate : null;
    }
    return null;
  };

  if (Array.isArray(images)) {
    const urls = images
      .map(item => {
        const u = coerceToUrl(item);
        return u || null;
      })
      .filter((u): u is string => !!u);
    return urls;
  }

  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return normalizeImages(parsed);
    } catch {
      // Comma-separated fallback
      const parts = images.split(',').map(s => s.trim()).filter(p => p.startsWith('http'));
      return parts;
    }
  }

  // Unknown format
  return [];
}

function transformServiceToResort(service: any) {
  const normalizedImages = normalizeImages(service.images);
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
    description: service.description || '',
    images: normalizedImages.length ? normalizedImages : (service.thumbnail_url ? [service.thumbnail_url] : []),
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
