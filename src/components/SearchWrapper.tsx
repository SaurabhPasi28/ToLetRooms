'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { MapPin } from 'lucide-react';

interface Property {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  address: {
    houseNumber?: string;
    buildingName?: string;
    street: string;
    landmark?: string;
    areaOrLocality?: string;
    city: string;
    state: string;
    pinCode: string;
    country?: string;
    coordinates?: { type: 'Point'; coordinates: [number, number] };
    fullAddress: string;
  };
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  propertyType: string;
  amenities: string[];
  media: Array<{ url: string; type: 'image' | 'video' }>;
  host: string;
  createdAt?: string;
  updatedAt?: string;
}

export function SearchWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  // Use ref to store scroll position to avoid re-renders
  const scrollPositionRef = useRef(0);
  const isInitialLoad = useRef(true);

  // Save scroll position before any navigation
  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
  };

  // Restore scroll position after navigation
  const restoreScrollPosition = () => {
    if (scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  };

  // Fetch properties based on search params
  const fetchProperties = async () => {
    // Don't save scroll position on initial load
    if (!isInitialLoad.current) {
      saveScrollPosition();
    }
    
    setIsLoading(true);

    try {
      // Build query string from search params
      const queryParams = new URLSearchParams();
      
      if (searchParams.get('query')) queryParams.set('query', searchParams.get('query')!);
      if (searchParams.get('location')) queryParams.set('location', searchParams.get('location')!);
      if (searchParams.get('minPrice')) queryParams.set('minPrice', searchParams.get('minPrice')!);
      if (searchParams.get('maxPrice')) queryParams.set('maxPrice', searchParams.get('maxPrice')!);
      if (searchParams.get('propertyType')) queryParams.set('propertyType', searchParams.get('propertyType')!);
      if (searchParams.get('bedrooms')) queryParams.set('bedrooms', searchParams.get('bedrooms')!);
      if (searchParams.get('amenities')) queryParams.set('amenities', searchParams.get('amenities')!);
      if (searchParams.get('maxGuests')) queryParams.set('maxGuests', searchParams.get('maxGuests')!);

      const response = await fetch(`/api/search?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform the properties to ensure media is properly formatted
        const transformedProperties = data.properties.map((property: any) => ({
          _id: property._id,
          title: property.title,
          description: property.description,
          isActive: property.isActive,
          address: property.address,
          maxGuests: property.maxGuests,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          price: property.price,
          propertyType: property.propertyType,
          amenities: property.amenities || [],
          // Ensure media is properly formatted for PropertyCard
          media: property.media?.map((mediaItem: any) => {
            // If mediaItem is already an object with url and type
            if (typeof mediaItem === 'object' && mediaItem.url) {
              return {
                url: mediaItem.url,
                type: mediaItem.type || (mediaItem.url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image')
              };
            }
            // If mediaItem is just a string URL
            if (typeof mediaItem === 'string') {
              return {
                url: mediaItem,
                type: mediaItem.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
              };
            }
            // Fallback
            return {
              url: '',
              type: 'image' as const
            };
          }).filter((item: any) => item.url) || [],
          host: property.host,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        }));
        
        setProperties(transformedProperties);
        setTotalResults(data.pagination.totalResults);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
      
      // Restore scroll position after a short delay, but not on initial load
      if (!isInitialLoad.current) {
        setTimeout(restoreScrollPosition, 100);
      } else {
        isInitialLoad.current = false;
      }
    }
  };

  // Fetch properties when search params change
  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  // Listen for search events from child components
  useEffect(() => {
    const handleSearchEvent = () => {
      saveScrollPosition();
    };

    // Add event listener for search events
    window.addEventListener('search', handleSearchEvent);
    
    return () => {
      window.removeEventListener('search', handleSearchEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Find Your Perfect
              <span className="text-primary"> Rental Home</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing properties in your preferred location with our advanced search
            </p>
          </div>
          
          <SearchBar className="mb-8" />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Searching properties...</p>
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Found {totalResults} properties
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No properties found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or location
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}