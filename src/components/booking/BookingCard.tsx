'use client';

import { Calendar, Play } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BookingCard({ booking }: {
  booking: {
    _id: string;
    property: {
      _id: string;
      title: string;
      media: Array<{
        url: string;
        type: 'image' | 'video';
      }>;
    };
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
  };
}) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2">
          <div className="flex gap-4">
            <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
              {booking.property?.media?.[0]?.type === 'image' && booking.property?.media?.[0]?.url ? (
                <Image
                  src={booking.property.media[0].url}
                  alt={booking.property.title || 'Property'}
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
              <h3 className="font-medium">{booking.property?.title || 'Untitled Property'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(booking.checkIn), 'MMM d, yyyy')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <div className="text-lg font-semibold">₹{booking.totalPrice}</div>
          <div className={`text-sm px-2 py-1 rounded-full ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/bookings/${booking._id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}