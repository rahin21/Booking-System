'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, Clock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface Service {
  s_id: number;
  s_name: string;
  s_type: string;
  location: string;
  price: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  rating?: number;
}

interface Customer {
  c_id: number;
  c_name: string;
  c_email: string;
  c_phone?: string;
  c_address?: string;
}

interface ReservationWithDetails {
  reservation_id: number;
  date: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  special_requests?: string;
  payment_status: string;
  s_id: number;
  c_id: number;
  service_type: string;
  price: number;
  created_at?: string;
  service?: Service;
  customer?: Customer;
}

export default function BookingsPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please sign in to view your bookings');
        return;
      }

      setUserEmail(user.email ?? null);

      // Find customer record by user email
      const { data: customerRecord, error: customerError } = await supabase
        .from('customer')
        .select('*')
        .eq('c_email', user.email)
        .maybeSingle();

      if (customerError) {
        console.error('Customer lookup error:', customerError);
        throw new Error(customerError.message);
      }

      if (!customerRecord) {
        setReservations([]);
        toast.info('No bookings found for your account yet.');
        return;
      }

      // Fetch reservations for the current customer by c_id
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservation')
        .select(`
          *,
          service:service(*),
          customer:customer(*)
        `)
        .eq('c_id', customerRecord.c_id)
        .order('date', { ascending: false });

      if (reservationsError) {
        console.error('Reservations error:', reservationsError);
        throw new Error(reservationsError.message);
      }

      setReservations(reservationsData || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your bookings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchUserBookings} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            {userEmail && `Showing bookings for ${userEmail}`}
          </p>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Bookings Found</CardTitle>
              <CardDescription>
                You haven't made any bookings yet. Start exploring our services to make your first reservation!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/">Browse Services</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation) => (
              <Card key={reservation.reservation_id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {reservation.service?.s_name || 'Service'}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {reservation.service?.location || 'Location not available'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(reservation.payment_status)}>
                      {reservation.payment_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Check-in</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(reservation.check_in_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Check-out</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(reservation.check_out_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Total Price</p>
                        <p className="text-sm text-gray-600">
                          ${reservation.price}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Guests</p>
                        <p className="text-sm text-gray-600">
                          {reservation.guest_count} {reservation.guest_count === 1 ? 'guest' : 'guests'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Service Type</p>
                        <p className="text-sm text-gray-600 capitalize">{reservation.service_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Reservation ID</p>
                        <p className="text-sm text-gray-600">#{reservation.reservation_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Booked On</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(reservation.created_at ?? reservation.date)}
                        </p>
                      </div>
                      {reservation.special_requests && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Special Requests</p>
                          <p className="text-sm text-gray-600">{reservation.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {reservation.service?.amenities && reservation.service.amenities.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {reservation.service.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}