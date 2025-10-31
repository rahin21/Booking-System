'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import ResortCard from '@/components/ResortCard';
import BookingForm, { BookingFormData } from '@/components/BookingForm';
import { createCustomer, createReservation } from '@/lib/database';
import { 
  Calendar, 
  Star, 
  Users, 
  MapPin,
  Mountain,
  Waves,
  Building,
  Trees,
  Droplets,
  Sun
} from 'lucide-react';

interface Resort {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  status: string;
  checkIn: string;
  checkOut: string;
  amenities: string[];
  rating: number;
  images?: string[];
}

interface HomeClientProps {
  initialResorts: Resort[];
  filterOptions?: {
    serviceTypes: string[];
    locations: string[];
    priceRanges: string[];
  };
}

const getLocationIcon = (location: string) => {
  switch (location) {
    case 'Mountain View':
      return <Mountain className="h-5 w-5 text-blue-600" />;
    case 'Beach Front':
      return <Waves className="h-5 w-5 text-blue-600" />;
    case 'City Center':
      return <Building className="h-5 w-5 text-gray-600" />;
    case 'Forest Retreat':
      return <Trees className="h-5 w-5 text-green-600" />;
    case 'Lakeside':
      return <Droplets className="h-5 w-5 text-blue-600" />;
    case 'Desert Oasis':
      return <Sun className="h-5 w-5 text-yellow-600" />;
    default:
      return <MapPin className="h-5 w-5 text-gray-600" />;
  }
};

export function HomeClient({ initialResorts, filterOptions }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState('All Prices');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);

  // Filter resorts based on search and filters
  const filteredResorts = initialResorts.filter(resort => {
    const matchesSearch = resort.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All Types' || resort.type === selectedType;
    
    const matchesLocation = selectedLocation === 'All Locations' || resort.location === selectedLocation;
    
    let matchesPrice = true;
    if (priceRange !== 'All Prices') {
      switch (priceRange) {
        case 'Under ৳1000':
          matchesPrice = resort.price < 1000;
          break;
        case '৳1000 - ৳5000':
          matchesPrice = resort.price >= 1000 && resort.price <= 5000;
          break;
        case '৳5000 - ৳10000':
          matchesPrice = resort.price >= 5000 && resort.price <= 10000;
          break;
        case '৳10000 - ৳15000':
          matchesPrice = resort.price >= 10000 && resort.price <= 15000;
          break;
        case '৳15000 - ৳20000':
          matchesPrice = resort.price >= 15000 && resort.price <= 20000;
          break;
        case 'Over ৳20000':
          matchesPrice = resort.price > 20000;
          break;
      }
    }

    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  const handleBookNow = (resortId: number) => {
    const resort = initialResorts.find(r => r.id === resortId);
    if (resort) {
      setSelectedResort(resort);
      setShowBookingForm(true);
    }
  };

  const handleBookingSubmit = async (bookingData: BookingFormData): Promise<void> => {
    console.log('🚀 Starting booking process with data:', bookingData);
    
    try {
      // Validate booking data
      if (!bookingData.customerName || !bookingData.customerEmail) {
        throw new Error('Customer name and email are required');
      }
      
      if (!bookingData.checkInDate || !bookingData.checkOutDate) {
        throw new Error('Check-in and check-out dates are required');
      }
      
      if (!selectedResort) {
        throw new Error('No resort selected for booking');
      }
      
      console.log('✅ Booking data validation passed');
      
      // First, create or get the customer
      const customerData = {
        c_name: bookingData.customerName,
        c_email: bookingData.customerEmail,
        c_phone: bookingData.customerPhone,
        c_address: bookingData.customerAddress || ''
      };
      
      console.log('👤 Creating customer with data:', customerData);
      const customer = await createCustomer(customerData);
      
      if (!customer) {
        console.error('❌ Failed to create customer - no customer returned');
        throw new Error('Failed to create customer account. Please check your information and try again.');
      }
      
      console.log('✅ Customer created/found successfully:', customer);
      
      // Calculate total price
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = selectedResort.price * days;
      
      console.log(`💰 Calculated price: ${selectedResort.price} × ${days} days = ${totalPrice}`);
      
      // Create the reservation
      const reservationData = {
          c_id: customer.c_id,
          s_id: selectedResort.id,
          check_in_date: bookingData.checkInDate,
          check_out_date: bookingData.checkOutDate,
          price: totalPrice,
          payment_status: 'pending',
          service_type: selectedResort.type
        };
      
      console.log('🏨 Creating reservation with data:', reservationData);
      const reservation = await createReservation(reservationData);
      
      if (!reservation) {
        console.error('❌ Failed to create reservation - no reservation returned');
        throw new Error('Failed to create reservation. Please try again.');
      }
      
      console.log('✅ Reservation created successfully:', reservation);
      
      // Success - show success message and close form
      alert(`🎉 Booking confirmed! Your reservation ID is ${reservation.reservation_id}. We will contact you soon at ${bookingData.customerEmail}.`);
      setShowBookingForm(false);
      setSelectedResort(null);
      
    } catch (error) {
      console.error('❌ Booking error occurred:', error);
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Sorry, there was an error processing your booking. Please try again.';
      
      if (error instanceof Error) {
        // Check for specific database errors
        if (error.message.includes('permission denied')) {
          errorMessage = 'Database access error. Please contact support if this persists.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'A booking with this information already exists.';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Invalid booking data. Please refresh the page and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('🔍 Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedResort(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedLocation('All Locations');
    setPriceRange('All Prices');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing resorts, hotels, and unique accommodations worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Explore Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-blue-600 hover:bg-opacity-20">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <SearchAndFilter
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedLocation={selectedLocation}
          priceRange={priceRange}
          onSearchChange={setSearchQuery}
          onTypeChange={setSelectedType}
          onLocationChange={setSelectedLocation}
          onPriceRangeChange={setPriceRange}
          onReset={resetFilters}
          serviceTypes={filterOptions?.serviceTypes}
          locations={filterOptions?.locations}
          priceRanges={filterOptions?.priceRanges}
        />
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Accommodations
          </h2>
          <p className="text-gray-600">
            {filteredResorts.length} of {initialResorts.length} results
          </p>
        </div>

        {filteredResorts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <p className="text-lg mb-2">No accommodations found</p>
                <p className="text-sm">Try adjusting your search criteria or filters</p>
                <Button onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResorts.map((resort) => (
              <ResortCard
                key={resort.id}
                {...resort}
                onBookNow={handleBookNow}
              />
            ))}
          </div>
        )}
      </div>

      {/* Popular Locations Section */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Popular Destinations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['Mountain View', 'Beach Front', 'City Center', 'Forest Retreat', 'Lakeside', 'Desert Oasis'].map((location) => (
            <Card key={location} className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4 text-center">
                <div className="mb-3 flex justify-center">
                  {getLocationIcon(location)}
                </div>
                <h3 className="font-semibold text-sm text-gray-900">{location}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure booking process with instant confirmation</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">All accommodations are verified and quality-checked</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedResort && (
        <BookingForm
          resortId={selectedResort.id}
          resortName={selectedResort.name}
          resortPrice={selectedResort.price}
          onClose={handleCloseBookingForm}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
}