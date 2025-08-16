// src/components/booking/BookingSummary.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Play,
  Heart,
  Share2,
  Mail,
  Phone,
  User,
  BedDouble,
  Bath,
  Star,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type Media = { url: string; type: 'image' | 'video' } | string;

export default function BookingSummary({
  property,
}: {
  property: {
    _id: string;
    title: string;
    description?: string;
    media: Media[];
    price: number;
    propertyType?: string;
    address: { street?: string; city?: string; state?: string; pinCode?: string };
    amenities?: string[];
    maxGuests: number;
    bedrooms?: number;
    bathrooms?: number;
    host?: { _id: string; name?: string; email?: string; phone?: string; avatar?: string | null };
  };
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Normalize media like PropertyDetails.tsx
  const mediaItems =
    Array.isArray(property.media)
      ? property.media.map((m: any) =>
          typeof m === 'string'
            ? { url: m, type: /\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i.test(m) ? 'video' : 'image' }
            : m
        )
      : [];

  const currentMedia = mediaItems[currentMediaIndex];

  // Initialize favorite from wishlist
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (!res.ok) return;
        const data = await res.json();
        const inWishlist = Array.isArray(data.wishlist)
          ? data.wishlist.some((item: any) => item.propertyId?._id === property._id)
          : false;
        if (mounted) setIsFavorite(!!inWishlist);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [property._id]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: property.title,
        text: property.title,
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // no-op
    }
  };

  const handleWishlistToggle = async () => {
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`/api/wishlist?propertyId=${property._id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove from wishlist');
        setIsFavorite(false);
        toast.success('Removed from wishlist');
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId: property._id }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (err?.error === 'Property already in wishlist') {
            setIsFavorite(true);
            toast.success('Already in wishlist');
          } else if (res.status === 401) {
            toast.error('Please login to add to wishlist');
          } else {
            throw new Error(err?.error || 'Failed to add to wishlist');
          }
        } else {
          setIsFavorite(true);
          toast.success('Added to wishlist');
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update wishlist');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Media Gallery (from PropertyDetails.tsx) */}
      <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
        {currentMedia?.type === 'image' ? (
          <Image src={currentMedia.url} alt={property.title} fill className="object-cover" priority />
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
              onClick={() =>
                setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setCurrentMediaIndex((prev) =>
                  prev === mediaItems.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Favorite + Share */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleWishlistToggle}
            disabled={favLoading}
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white disabled:opacity-60"
            aria-label="Favorite"
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/80 rounded-full shadow-md hover:bg-white"
            aria-label="Copy link"
            title="Copy link"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {mediaItems.map((media, index) => (
            <button
              key={index}
              onClick={() => setCurrentMediaIndex(index)}
              className={`relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                index === currentMediaIndex ? 'ring-2 ring-primary' : ''
              }`}
              aria-label={`Media ${index + 1}`}
            >
              {media.type === 'image' ? (
                <Image src={media.url} alt={`${property.title} ${index + 1}`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Rest of your summary UI (unchanged) */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{property.title}</h1>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">
                {[property.address?.street, property.address?.city, property.address?.state, property.address?.pinCode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            4.8
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {property.maxGuests} guests
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4" />
            {property.bedrooms ?? 1} beds
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-4 h-4" />
            {property.bathrooms ?? 1} baths
          </div>
        </div>

        {!!property.amenities?.length && (
          <div className="text-sm">
            <div className="font-medium mb-1">Amenities</div>
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 8).map((a, i) => (
                <span key={i} className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {a}
                </span>
              ))}
              {property.amenities.length > 8 && (
                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                  +{property.amenities.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {property.host && (
          <div className="border rounded-lg p-3">
            <div className="text-sm font-medium mb-2">Host</div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{property.host.name || 'Host'}</div>
                <div className="text-xs text-muted-foreground truncate">{property.host.email || ''}</div>
                {property.host.phone && (
                  <div className="text-xs text-muted-foreground truncate">{property.host.phone}</div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {property.host.email && (
                  <a
                    href={`mailto:${property.host.email}`}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </a>
                )}
                {property.host.phone && (
                  <a
                    href={`tel:${property.host.phone}`}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium mb-2">Policies</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Check-in after 2:00 PM • Check-out before 11:00 AM</li>
            <li>Free cancellation up to 7 days before check-in</li>
            <li>No parties or events • No smoking</li>
          </ul>
        </div>

        <div className="text-right font-medium">₹{property.price}/night</div>
      </div>
    </div>
  );
}