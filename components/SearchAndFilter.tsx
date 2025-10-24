import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Calendar } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  selectedType: string;
  selectedLocation: string;
  priceRange: string;
  onSearchChange: (query: string) => void;
  onTypeChange: (type: string) => void;
  onLocationChange: (location: string) => void;
  onPriceRangeChange: (range: string) => void;
  onReset: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  selectedType,
  selectedLocation,
  priceRange,
  onSearchChange,
  onTypeChange,
  onLocationChange,
  onPriceRangeChange,
  onReset
}) => {
  const serviceTypes = [
    'All Types',
    'Resort',
    'Hotel',
    'Villa',
    'Cabin',
    'Conference Hall',
    'Vehicle'
  ];

  const locations = [
    'All Locations',
    'Mountain View',
    'Beach Front',
    'City Center',
    'Forest Retreat',
    'Lakeside',
    'Desert Oasis'
  ];

  const priceRanges = [
    'All Prices',
    'Under $100',
    '$100 - $200',
    '$200 - $300',
    '$300 - $500',
    'Over $500'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Search & Filter</h2>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search resorts, hotels, or destinations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 text-base"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Service Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Service Type
          </label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Price Range
          </label>
          <Select value={priceRange} onValueChange={onPriceRangeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 opacity-0">
            Reset
          </label>
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedType !== 'All Types' || selectedLocation !== 'All Locations' || priceRange !== 'All Prices') && (
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {selectedType !== 'All Types' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Type: {selectedType}
              </span>
            )}
            {selectedLocation !== 'All Locations' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Location: {selectedLocation}
              </span>
            )}
            {priceRange !== 'All Prices' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Price: {priceRange}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { SearchAndFilter };
