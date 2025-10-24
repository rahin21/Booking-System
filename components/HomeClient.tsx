'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchAndFilter } from '@/components/SearchAndFilter';
import ResortCard from '@/components/ResortCard';
import BookingForm, { BookingFormData } from '@/components/BookingForm';
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
}

interface HomeClientProps {
  initialResorts: Resort[];
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

export function HomeClient({ initialResorts }: HomeClientProps) {
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
        case 'Under ৳100':
          matchesPrice = resort.price < 100;
          break;
        case '৳100 - ৳200':
          matchesPrice = resort.price >= 100 && resort.price <= 200;
          break;
        case '৳200 - ৳300':
          matchesPrice = resort.price >= 200 && resort.price <= 300;
          break;
        case '৳300 - ৳500':
          matchesPrice = resort.price >= 300 && resort.price <= 500;
          break;
        case 'Over ৳500':
          matchesPrice = resort.price > 500;
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

  const handleBookingSubmit = (bookingData: BookingFormData) => {
    // Here you would typically send the booking data to your backend
    console.log('Booking submitted:', bookingData);
    alert('Booking submitted successfully! We will contact you soon.');
    setShowBookingForm(false);
    setSelectedResort(null);
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