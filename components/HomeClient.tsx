'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import ResortCard from '@/components/ResortCard';
import AnimateIn from '@/components/AnimateIn';
import BookingForm, { BookingFormData } from '@/components/BookingForm';
import { createCustomer, createReservation, createPayment } from '@/lib/database';
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
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  // Filter resorts based on search and filters
  const filteredResorts = initialResorts.filter(resort => {
    const matchesSearch = resort.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All Types' || resort.type === selectedType;
    
    const matchesLocation = selectedLocation === 'All Locations' || resort.location === selectedLocation;
    
    let matchesPrice = true;
    if (priceRange !== 'All Prices') {
      const normalized = priceRange.replace(/[,৳]/g, '').trim();

      if (/^Under/i.test(priceRange)) {
        const maxMatch = normalized.match(/(\d+)/);
        const max = maxMatch ? parseInt(maxMatch[1], 10) : Number.MAX_SAFE_INTEGER;
        matchesPrice = resort.price < max;
      } else if (/^Over/i.test(priceRange)) {
        const minMatch = normalized.match(/(\d+)/);
        const min = minMatch ? parseInt(minMatch[1], 10) : 0;
        matchesPrice = resort.price > min;
      } else {
        const nums = normalized.match(/\d+/g);
        if (nums && nums.length >= 2) {
          const min = parseInt(nums[0], 10);
          const max = parseInt(nums[1], 10);
          matchesPrice = resort.price >= min && resort.price <= max;
        } else {
          matchesPrice = true; // Fallback if parsing fails
        }
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
          service_type: selectedResort.type,
          guest_count: bookingData.guestCount,
          special_requests: bookingData.specialRequests
        };
      
      console.log('🏨 Creating reservation with data:', reservationData);
      const reservation = await createReservation(reservationData);

      if (!reservation) {
        console.error('❌ Failed to create reservation - no reservation returned');
        throw new Error('Failed to create reservation. Please try again.');
      }

      console.log('✅ Reservation created successfully:', reservation);

      // Create a dummy payment record based on selected method
      try {
        await createPayment({
          payment_method: bookingData.paymentMethod,
          amount: totalPrice,
          reservation_id: reservation.reservation_id,
        });
        console.log('💳 Payment record created for method:', bookingData.paymentMethod);
      } catch (payErr) {
        console.warn('Payment creation failed (dummy gateway). Continuing with pending status.', payErr);
      }

      // Success - show success toast and close form
      toast.success(`Booking confirmed! Reservation ID: ${reservation.reservation_id}. Payment: ${bookingData.paymentMethod.replace('_', ' ')}`);
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
      toast.error(errorMessage);
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

  const handleExploreNow = () => {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    setShowLearnMoreModal(true);
  };

  const handleCloseLearnMoreModal = () => {
    setShowLearnMoreModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <AnimateIn>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing resorts, hotels, and unique accommodations in Bangladesh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={handleExploreNow}>
                Explore Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-blue-600 hover:bg-blue-600 hover:bg-opacity-20" onClick={handleLearnMore}>
                Learn More
              </Button>
            </div>
            </AnimateIn>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div id="search-section" className="container mx-auto px-4 py-8">
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
            {filteredResorts.map((resort, idx) => (
              <AnimateIn key={resort.id} delay={idx * 0.05}>
                <ResortCard
                  {...resort}
                  onBookNow={handleBookNow}
                />
              </AnimateIn>
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
          {['Mountain View', 'Beach Front', 'City Center', 'Forest Retreat', 'Lakeside', 'Desert Oasis'].map((location, idx) => (
            <AnimateIn key={location} delay={idx * 0.05}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 text-center">
                  <div className="mb-3 flex justify-center">
                    {getLocationIcon(location)}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900">{location}</h3>
                </CardContent>
              </Card>
            </AnimateIn>
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
            <AnimateIn className="text-center" delay={0}>
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure booking process with instant confirmation</p>
            </AnimateIn>
            <AnimateIn className="text-center" delay={0.05}>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">All accommodations are verified and quality-checked</p>
            </AnimateIn>
            <AnimateIn className="text-center" delay={0.1}>
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for all your needs</p>
            </AnimateIn>
          </div>
        </div>
      </div>

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">About Our Platform</h2>
                <Button variant="outline" size="sm" onClick={handleCloseLearnMoreModal}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-600">Welcome to Your Ultimate Booking Experience</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our platform connects travelers with exceptional accommodations in Bangladesh. Whether you're seeking a luxury resort, 
                    a cozy mountain retreat, or a beachfront paradise, we make finding and booking your perfect stay effortless.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-gray-800">Easy Booking Process</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Our streamlined booking system allows you to reserve your accommodation in just a few clicks. 
                      Instant confirmation and secure payment processing ensure peace of mind.
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Star className="h-6 w-6 text-green-600 mr-2" />
                      <h4 className="font-semibold text-gray-800">Quality Guaranteed</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Every property on our platform is carefully vetted and regularly inspected to ensure 
                      the highest standards of quality, cleanliness, and service.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Users className="h-6 w-6 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-gray-800">24/7 Customer Support</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Our dedicated support team is available around the clock to assist with bookings, 
                      answer questions, and resolve any issues during your stay.
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <MapPin className="h-6 w-6 text-orange-600 mr-2" />
                      <h4 className="font-semibold text-gray-800">Global Destinations</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      From bustling city centers to remote natural retreats, our extensive network 
                      covers destinations across the globe to suit every travel preference.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                  <h4 className="text-xl font-semibold mb-3">Why Choose Us?</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                          Best Price Guarantee
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                          Free Cancellation Options
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                          Verified Guest Reviews
                        </li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                          Secure Payment Processing
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                          Mobile-Friendly Platform
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                          Loyalty Rewards Program
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Ready to start your journey? Explore our accommodations and book your perfect stay today!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => { handleCloseLearnMoreModal(); handleExploreNow(); }} className="bg-blue-600 hover:bg-blue-700">
                      Start Exploring
                    </Button>
                    <Button variant="outline" onClick={handleCloseLearnMoreModal}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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