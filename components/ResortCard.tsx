import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, Users, Wifi, Car, Coffee } from 'lucide-react';

interface ResortCardProps {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  status: string;
  checkIn: string;
  checkOut: string;
  amenities?: string[];
  rating?: number;
  images?: string[];
  onBookNow: (id: number) => void;
}

const ResortCard: React.FC<ResortCardProps> = ({
  id,
  name,
  type,
  location,
  price,
  status,
  checkIn,
  checkOut,
  amenities = [],
  rating = 4.5,
  images = [],
  onBookNow
}) => {
  const isAvailable = status === 'available';

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'restaurant':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300">
      {images.length > 0 && (
        <div className="w-full h-40 bg-gray-100 overflow-hidden">
          <img
            src={images[0]}
            alt={`${name} image`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">{name}</CardTitle>
            <CardDescription className="text-sm text-gray-600 capitalize">{type}</CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium">{checkIn}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium">{checkOut}</span>
          </div>
          
          {amenities.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-gray-600 mb-2">Amenities:</p>
              <div className="flex flex-wrap gap-2">
                {amenities.slice(0, 3).map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t">
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600"><b className='text-xl'>৳</b>{price}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isAvailable ? 'Available' : 'Booked'}
            </span>
          </div>
          <Button 
            className="w-full" 
            disabled={!isAvailable}
            onClick={() => onBookNow(id)}
          >
            {isAvailable ? 'Book Now' : 'Not Available'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResortCard;
