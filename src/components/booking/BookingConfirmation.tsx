'use client';

import { Calendar, Check, MapPin, Play, User, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface BookingConfirmationProps {
  property: {
    _id: string;
    title: string;
    media: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    price: number;
    address: {
      street?: string;
      city: string;
      state: string;
    };
    maxGuests: number;
    amenities?: string[];
  };
  checkIn: Date;
  checkOut: Date;
  guests: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function BookingConfirmation({
  property,
  checkIn,
  checkOut,
  guests,
  user,
}: BookingConfirmationProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Guest information state
  const [guestInfo, setGuestInfo] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const basePrice = nights * property.price;
  const serviceFee = Math.round(basePrice * 0.12);
  const cleaningFee = 500; // Fixed cleaning fee
  const taxes = Math.round(basePrice * 0.05);
  const total = basePrice + serviceFee + cleaningFee + taxes;

  const validateForm = () => {
    if (!guestInfo.name.trim()) {
      toast.error('Guest name is required');
      return false;
    }
    if (!guestInfo.email.trim()) {
      toast.error('Guest email is required');
      return false;
    }
    if (!guestInfo.phone.trim()) {
      toast.error('Guest phone number is required');
      return false;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    if (!user || submitting) {
      toast.error('You must be logged in to book.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property._id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests,
          guestInfo,
          specialRequests,
          basePrice,
          serviceFee,
          cleaningFee,
          taxes,
          totalPrice: total
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }
      
      toast.success('Booking confirmed successfully!');
      router.push(`/bookings/${data.booking._id}`);
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Confirm your booking</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your trip details and provide guest information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property details */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your trip</h2>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-24 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                {property.media[0]?.type === 'image' ? (
                  <Image
                    src={property.media[0].url}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{property.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.address.city}, {property.address.state}
                </p>
                {property.amenities && property.amenities.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {property.amenities.slice(0, 3).join(' • ')}
                    {property.amenities.length > 3 && ` • +${property.amenities.length - 3} more`}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Dates</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Guests</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Guest Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="guestName">Full Name *</Label>
                <Input
                  id="guestName"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="guestEmail">Email Address *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="guestPhone">Phone Number *</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Emergency Contact (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={guestInfo.emergencyContact.name}
                    onChange={(e) => setGuestInfo(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={guestInfo.emergencyContact.phone}
                    onChange={(e) => setGuestInfo(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                    placeholder="Emergency contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelation">Relationship</Label>
                  <Input
                    id="emergencyRelation"
                    value={guestInfo.emergencyContact.relationship}
                    onChange={(e) => setGuestInfo(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or requests for your stay..."
                rows={3}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payment Method</h2>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Credit/Debit Card</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">VISA</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">MasterCard</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">UPI</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Terms & Conditions</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Cancellation Policy:</strong> Free cancellation up to 7 days before check-in. 
                Cancellations within 7 days may incur charges.
              </p>
              <p>
                <strong>House Rules:</strong> No smoking, no pets, maximum {property.maxGuests} guests, 
                quiet hours 10 PM - 8 AM.
              </p>
              <p>
                <strong>Check-in/out:</strong> Check-in after 3:00 PM, check-out before 11:00 AM.
              </p>
            </div>
            
            <div className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the terms and conditions, house rules, and cancellation policy
              </label>
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="sticky top-4 h-fit">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Booking Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  ₹{property.price} × {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="text-gray-900 dark:text-white">₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                <span className="text-gray-900 dark:text-white">₹{serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Cleaning fee</span>
                <span className="text-gray-900 dark:text-white">₹{cleaningFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                <span className="text-gray-900 dark:text-white">₹{taxes.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Button 
              className="w-full mb-4" 
              size="lg" 
              onClick={handleConfirmBooking} 
              disabled={submitting || !agreedToTerms}
            >
              {submitting ? 'Processing...' : 'Confirm and Pay'}
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              You won&apos;t be charged until the host confirms your booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}