import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaymentModal, { PaymentDetails, PaymentMethod } from '@/components/PaymentModal';
import { Calendar, User, Mail, Phone, MapPin, CreditCard, Loader2 } from 'lucide-react';

interface BookingFormProps {
  resortId: number;
  resortName: string;
  resortPrice: number;
  onClose: () => void;
  onSubmit: (bookingData: BookingFormData) => Promise<void>;
}

export interface BookingFormData {
  resortId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  checkInDate: string;
  checkOutDate: string;
  specialRequests: string;
  guestCount: number;
  paymentMethod: 'cash_on_delivery' | 'bkash' | 'bank';
  bkashNumber?: string;
  bkashTrxId?: string;
  bankName?: string;
  bankRef?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({
  resortId,
  resortName,
  resortPrice,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    resortId,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
    guestCount: 1,
    paymentMethod: 'cash_on_delivery',
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone is required';
    }
    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }
    if (formData.checkInDate && formData.checkOutDate && 
        new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      newErrors.checkOutDate = 'Check-out date must be after check-in date';
    }

    if (!formData.guestCount || formData.guestCount < 1) {
      newErrors.guestCount = 1;
    }

    // Payment validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required' as any;
    } else if (formData.paymentMethod === 'bkash') {
      if (!formData.bkashNumber || !/^\d{11}$/.test(formData.bkashNumber)) {
        newErrors.bkashNumber = 'Valid bKash number (11 digits) required';
      }
      if (!formData.bkashTrxId || formData.bkashTrxId.trim().length < 6) {
        newErrors.bkashTrxId = 'bKash transaction ID is required';
      }
    } else if (formData.paymentMethod === 'bank') {
      if (!formData.bankName || formData.bankName.trim().length < 2) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.bankRef || formData.bankRef.trim().length < 4) {
        newErrors.bankRef = 'Reference number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        await onSubmit(formData);
      } catch (error) {
        setSubmitError('Failed to process booking. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const calculateTotalPrice = () => {
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    if (checkIn && checkOut && checkIn < checkOut) {
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return resortPrice * days;
    }
    return resortPrice;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Book Your Stay</CardTitle>
              <CardDescription className="text-lg">{resortName}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.customerName ? 'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500">{errors.customerName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="Enter your email"
                    className={errors.customerEmail ? 'border-red-500' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-500">{errors.customerEmail}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="Enter your phone number"
                    className={errors.customerPhone ? 'border-red-500' : ''}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500">{errors.customerPhone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkInDate">Check-in Date *</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={formData.checkInDate}
                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.checkInDate ? 'border-red-500' : ''}
                  />
                  {errors.checkInDate && (
                    <p className="text-sm text-red-500">{errors.checkInDate}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="checkOutDate">Check-out Date *</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={formData.checkOutDate}
                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                    className={errors.checkOutDate ? 'border-red-500' : ''}
                  />
                  {errors.checkOutDate && (
                    <p className="text-sm text-red-500">{errors.checkOutDate}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestCount">Guests *</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min={1}
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value, 10) || 1)}
                    className={errors.guestCount ? 'border-red-500' : ''}
                  />
                  {errors.guestCount && (
                    <p className="text-sm text-red-500">{errors.guestCount}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Input
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requests or requirements?"
                />
              </div>
          </div>

            {/* Payment Details (Modal) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h3>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(true)}>
                  Enter Payment Details
                </Button>
                {formData.paymentMethod && (
                  <span className="text-sm text-gray-700">
                    Selected: <span className="font-medium">{formData.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : formData.paymentMethod === 'bkash' ? 'bKash' : 'Bank Transfer'}</span>
                  </span>
                )}
              </div>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500">{errors.paymentMethod as any}</p>
              )}

              <PaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                initialMethod={formData.paymentMethod as PaymentMethod}
                initialDetails={{
                  bkashNumber: formData.bkashNumber,
                  bkashTrxId: formData.bkashTrxId,
                  bankName: formData.bankName,
                  bankRef: formData.bankRef,
                }}
                onConfirm={(details: PaymentDetails) => {
                  handleInputChange('paymentMethod', details.paymentMethod);
                  if (details.paymentMethod === 'bkash') {
                    handleInputChange('bkashNumber', details.bkashNumber || '');
                    handleInputChange('bkashTrxId', details.bkashTrxId || '');
                  } else {
                    // clear bKash fields
                    handleInputChange('bkashNumber', '');
                    handleInputChange('bkashTrxId', '');
                  }
                  if (details.paymentMethod === 'bank') {
                    handleInputChange('bankName', details.bankName || '');
                    handleInputChange('bankRef', details.bankRef || '');
                  } else {
                    // clear bank fields
                    handleInputChange('bankName', '');
                    handleInputChange('bankRef', '');
                  }
                }}
              />
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Price Summary
              </h3>
              
              <div className="flex justify-between text-sm">
                <span>Price per night:</span>
                <span>${resortPrice}</span>
              </div>
              
              {formData.checkInDate && formData.checkOutDate && (
                <div className="flex justify-between text-sm">
                  <span>Number of nights:</span>
                  <span>
                    {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Guests:</span>
                <span>{formData.guestCount}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
