"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Users, Star, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/property/PropertyCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface WishlistItem {
  _id: string;
  propertyId: {
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
  createdAt: string;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (propertyId: string) => {
    setIsRemoving(propertyId);
    try {
      const response = await fetch(`/api/wishlist?propertyId=${propertyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.propertyId._id !== propertyId));
        toast.success('Removed from wishlist');
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleBookNow = (propertyId: string) => {
    router.push(`/book/${propertyId}`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
              <p className="text-muted-foreground">
                Your saved properties and favorites
              </p>
            </div>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle>Your wishlist is empty</CardTitle>
              <CardDescription>
                Start exploring properties and add them to your wishlist to see them here
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/search')}>
                Explore Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {wishlist.length} {wishlist.length === 1 ? 'property' : 'properties'} in your wishlist
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item._id} className="relative group">
                  <PropertyCard property={item.propertyId} />
                  
                  {/* Remove from wishlist button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    onClick={() => handleRemoveFromWishlist(item.propertyId._id)}
                    disabled={isRemoving === item.propertyId._id}
                  >
                    {isRemoving === item.propertyId._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Quick book button */}
                  <Button
                    className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    onClick={() => handleBookNow(item.propertyId._id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
