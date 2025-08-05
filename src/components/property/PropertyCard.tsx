
"use client"
import { MapPin, Star, Users, ChevronLeft, ChevronRight, Calendar, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PropertyCard({ property, editable = false }: { 
  property: {
    _id: string;
    title: string;
    media?: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    isActive: boolean;
    address: {
      city: string;
      state: string;
    };
    maxGuests: number;
    bedrooms: number;
    price: number;
  };
  editable?: boolean;
}) {
  const router = useRouter();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePrev = () => {
    setCurrentMediaIndex(prev => 
      prev === 0 ? property.media!.length - 1 : prev - 1
    );
    // Pause video when navigating
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleNext = () => {
    setCurrentMediaIndex(prev => 
      prev === property.media!.length - 1 ? 0 : prev + 1
    );
    // Pause video when navigating
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        const deleteMediaPromises = property.media!.map(async (media) => {
          const publicId = media.url.split('/').pop()?.split('.')[0];
          if (!publicId) return;
          
          await fetch('/api/sign-upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId })
          });
        });

        await Promise.all(deleteMediaPromises);

        const response = await fetch(`/api/properties/${property._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Property deleted');
          router.refresh();
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        console.log(error);
        toast.error('Failed to delete property');
      }
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property.title,
        text: `Check out this amazing property: ${property.title}`,
        url: `${window.location.origin}/property/${property._id}`,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/property/${property._id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const currentMedia = property.media?.[currentMediaIndex];

  return (
    <div className="group relative bg-background border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/property/${property._id}`} className="block">
        <div className="relative aspect-video bg-muted">
          {property.media?.length ? (
            <>
              {currentMedia?.type === 'image' ? (
                <Image
                  src={currentMedia.url}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority
                />
              ) : currentMedia?.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  controls={false}
                  muted
                  loop
                  playsInline
                />
              ) : null}
              
              {/* Navigation arrows (only show if multiple media items exist) */}
              {property.media.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 shadow-sm hover:bg-background z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 shadow-sm hover:bg-background z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {/* Media type indicator and position */}
              <div className="absolute top-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md z-10 backdrop-blur-sm">
                {currentMediaIndex + 1}/{property.media.length}
                {currentMedia?.type === 'video' && (
                  <span className="ml-1">🎥</span>
                )}
              </div>

              {/* Media indicator dots */}
              {property.media.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {property.media.map((media, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentMediaIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentMediaIndex 
                          ? media.type === 'video' ? 'bg-primary' : 'bg-background' 
                          : 'bg-background/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Action buttons overlay */}
              <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFavorite(!isFavorite);
                    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare();
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="text-sm">No Media</p>
              </div>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <Badge variant={property.isActive ? "default" : "secondary"}>
            {property.isActive ? 'Active' : 'Draft'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            {property.address.city}, {property.address.state}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{property.maxGuests} guests</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="text-right font-semibold text-foreground">
            ₹{property.price.toLocaleString()}/night
          </div>
        </div>
        
        {editable && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/properties/edit/${property._id}`)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        )}

        {!editable && (
          <Button
            onClick={() => router.push(`/book/${property._id}`)}
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        )}
      </div>
    </div>
  );
}

