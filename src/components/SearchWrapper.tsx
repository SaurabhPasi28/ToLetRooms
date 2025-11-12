'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import PropertyCard from '@/components/property/PropertyCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { MobileFilterButton } from '@/components/MobileFilterButton';
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

const CACHE_KEY = 'property_search_cache';
const SCROLL_KEY = 'property_search_scroll';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function SearchWrapper() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  const isInitialMount = useRef(true);
  const hasRestoredScroll = useRef(false);
  const isFetching = useRef(false);

  // Continuously save scroll position and data while on home page
  useEffect(() => {
    const saveState = () => {
      if (properties.length > 0 && (pathname === '/' || pathname === '')) {
        const cacheData = {
          properties,
          totalResults,
          searchParams: searchParams.toString(),
          timestamp: Date.now(),
          scrollPosition: window.scrollY
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      }
    };

    // Save state periodically while scrolling
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveState, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Save when component unmounts
    return () => {
      saveState();
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [properties, totalResults, searchParams, pathname]);

  // Try to restore from cache on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cachedScroll = sessionStorage.getItem(SCROLL_KEY);
      
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const age = Date.now() - parsed.timestamp;
          
          // Check if cache is still valid and search params match
          if (age < CACHE_DURATION && parsed.searchParams === searchParams.toString()) {
            console.log('Restoring from cache, scroll position:', parsed.scrollPosition);
            setProperties(parsed.properties);
            setTotalResults(parsed.totalResults);
            setIsLoading(false);
            
            // Restore scroll position with multiple attempts to ensure it works
            const scrollPos = parseInt(cachedScroll || String(parsed.scrollPosition), 10);
            if (scrollPos > 0 && !hasRestoredScroll.current) {
              // Try immediate restore
              window.scrollTo({ top: scrollPos, behavior: 'instant' as ScrollBehavior });
              
              // Also try after DOM is ready
              requestAnimationFrame(() => {
                window.scrollTo({ top: scrollPos, behavior: 'instant' as ScrollBehavior });
              });
              
              // And with a delay to ensure content is rendered
              setTimeout(() => {
                window.scrollTo({ top: scrollPos, behavior: 'instant' as ScrollBehavior });
                hasRestoredScroll.current = true;
                console.log('Scroll restored to:', scrollPos);
              }, 100);
              
              // Final attempt after a longer delay
              setTimeout(() => {
                if (Math.abs(window.scrollY - scrollPos) > 50) {
                  window.scrollTo({ top: scrollPos, behavior: 'instant' as ScrollBehavior });
                  console.log('Final scroll adjustment to:', scrollPos);
                }
              }, 300);
            }
            
            isInitialMount.current = false;
            return; // Skip fetching if we have valid cache
          }
        } catch (error) {
          console.error('Error restoring cache:', error);
        }
      }
      
      isInitialMount.current = false;
    }
  }, [searchParams]);

  // Fetch properties based on search params
  const fetchProperties = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) {
      return;
    }

    // If we already have data from cache and params haven't changed, skip fetch
    if (!isInitialMount.current && properties.length > 0) {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (parsed.searchParams === searchParams.toString()) {
            console.log('Skipping fetch - using cached data');
            return; // Skip refetch if cache matches
          }
        } catch {
          // Continue with fetch - ignore parsing errors
        }
      }
    }
    
    isFetching.current = true;
    setIsLoading(true);
    
    // Save current scroll position before fetching new results
    const currentScroll = window.scrollY;

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

      console.log('Fetching properties from API...');
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
        
        // Cache the new data
        const cacheData = {
          properties: transformedProperties,
          totalResults: data.pagination.totalResults,
          searchParams: searchParams.toString(),
          timestamp: Date.now(),
          scrollPosition: currentScroll
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        // If search params changed (new search), scroll to top
        if (currentScroll > 300) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        console.log('Properties fetched and cached:', transformedProperties.length);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  };

  // Fetch properties when search params change (but not on initial mount if we have cache)
  useEffect(() => {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    let shouldFetch = true;

    if (isInitialMount.current && cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION && parsed.searchParams === searchParams.toString()) {
          shouldFetch = false; // Don't fetch if we have valid cache
        }
      } catch {
        // Continue with fetch - ignore parsing errors
      }
    }

    if (shouldFetch) {
      fetchProperties();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          {/* Filters Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
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

      {/* Mobile Filter Button */}
      <MobileFilterButton />
    </div>
  );
}