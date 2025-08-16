'use client';

import {ChevronLeft, ChevronRight,MapPin, Star, User, Play,Check, Heart } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import BookingWidget from '@/components/booking/BookingWidget';
// import { DateRange } from 'react-day-picker';
import { Share2, AlertCircle } from 'lucide-react';
// import { Toast } from 'react-hot-toast';
// import { Skeleton } from '@/components/ui/skeleton';
interface PropertyDetailsProps {
  property: {
    _id: string;
    title: string;
    description: string;
    media: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    price: number;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    amenities: string[];
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    host: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  // const [dateRange, setDateRange] = useState<DateRange | undefined>();
  // const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const mediaItems = Array.isArray(property.media)
    ? property.media.map((m: any) =>
        typeof m === 'string'
          ? { url: m, type: /\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i.test(m) ? 'video' : 'image' }
          : m
      )
    : [];
  const currentMedia = mediaItems[currentMediaIndex];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Media Gallery */}
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
        {currentMedia?.type === 'image' ? (
          <Image
            src={currentMedia.url}
            alt={property.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <video
            src={currentMedia?.url}
            className="object-cover w-full h-full"
            controls
            autoPlay
            loop
            muted
          />
        )}

        {/* Navigation arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={() => setCurrentMediaIndex(prev => 
                prev === 0 ? mediaItems.length - 1 : prev - 1
              )}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMediaIndex(prev => 
                prev === mediaItems.length - 1 ? 0 : prev + 1
              )}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Favorite and Share buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white"
            title="Copy link"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto py-2">
          {mediaItems.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentMediaIndex(index)}
              className={`relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                index === currentMediaIndex ? 'ring-2 ring-primary' : ''
              }`}
            >
              {media.type === 'image' ? (
                <Image
                  src={media.url}
                  alt={`${property.title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Property details */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8 (24 reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{property.address.city}, {property.address.state}</span>
            </div>
          </div>

          <div className="border-b pb-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">About this property</h2>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          <div className="border-b pb-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety info - responsive and well-positioned */}
          <div className="border rounded-lg p-4 mb-8 bg-blue-50 border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium mb-1">Safety information</h3>
                <p className="text-sm text-muted-foreground">
                  This property has safety measures in place including smoke detectors
                  and a first aid kit. Always practice safe traveling.
                </p>
              </div>
            </div>
          </div>

          {/* Host information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Hosted by {property.host.name}</h2>
            <div className="flex items-center gap-4">
              {property.host.avatar ? (
                <Image
                  src={property.host.avatar}
                  alt={property.host.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium">{property.host.name}</p>
                <p className="text-sm text-muted-foreground">Superhost</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}