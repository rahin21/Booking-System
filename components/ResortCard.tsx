import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, Users, Wifi, Car, Coffee, ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  
  const isAvailable = status === 'available';
  const hasImages = images.length > 0;

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300">
        {/* Image Gallery Section */}
        <div className="w-full h-40 bg-gray-100 overflow-hidden relative">
          {hasImages ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${name} image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                onClick={() => openModal(currentImageIndex)}
              />
              
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
              
              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{images.length}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No images available</p>
              </div>
            </div>
          )}
        </div>
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

    {/* Full-Screen Image Modal */}
    {showModal && hasImages && (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Modal Image */}
          <img
            src={images[modalImageIndex]}
            alt={`${name} image ${modalImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Modal Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevModalImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextModalImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Modal Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
            {modalImageIndex + 1} of {images.length}
          </div>

          {/* Modal Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setModalImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === modalImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </>
  );
};

export default ResortCard;
