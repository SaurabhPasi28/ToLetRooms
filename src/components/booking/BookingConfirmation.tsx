'use client';

import { Calendar, Check,MapPin,Play, User } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
// import { toast } from 'react-hot-toast';

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
      street: string;
      city: string;
      state: string;
    };
  };
  checkIn: Date;
  checkOut: Date;
  guests: number;
  user: {
    id: string;
    name: string;
    email: string;
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

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const subtotal = nights * property.price;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleConfirmBooking = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property._id,
          checkIn,
          checkOut,
          guests,
          totalPrice: total,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      const data = await response.json();
      router.push(`/bookings/${data.booking._id}`);
      // toast({
      //   title: 'Booking confirmed!',
      //   description: 'Your reservation has been successfully created.',
      // });
      toast.success("Booking confirmed!");
    } catch (error:any) {
      // toast({
      //   title: 'Booking failed',
      //   description: 'There was an error processing your booking. Please try again.',
      //   variant: 'destructive',
      // });
      toast.error("Booking failed",error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Confirm your booking</h1>
        <p className="text-muted-foreground">
          Review your trip details before proceeding to payment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your trip</h2>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-24 h-16 rounded-md overflow-hidden">
                {property.media[0]?.type === 'image' ? (
                  <Image
                    src={property.media[0].url}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium">{property.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.address.city}, {property.address.state}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Dates</span>
                </div>
                <div className="text-right">
                  {format(checkIn, 'MMM d, yyyy')} - {format(checkOut, 'MMM d, yyyy')}
                  <p className="text-sm text-muted-foreground">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Guests</span>
                </div>
                <div>
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Payment method</h2>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span>Credit/Debit Card</span>
                <div className="flex gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">VISA</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">MasterCard</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Cancellation policy</h2>
            <p className="text-muted-foreground mb-4">
              Free cancellation up to 7 days before check-in. After that, cancellations made less than 24 hours before check-in will result in a charge of 50% of the total booking amount.
            </p>
            <p className="text-muted-foreground">
              A full refund will be issued if cancelled within 48 hours of booking, provided the cancellation occurs at least 14 days before check-in.
            </p>
          </div>
        </div>

        {/* Booking summary */}
        <div className="sticky top-4 h-fit">
          <div className="border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Booking summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ₹{property.price} × {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span>₹{serviceFee}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleConfirmBooking}
            >
              Confirm and pay
            </Button>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              You won&apos;t be charged until the host confirms your booking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}