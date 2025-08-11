'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Filter, Home, Building2, Mountain, Umbrella, TreePine, Wifi, Snowflake, ChefHat, Car, Tv } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const propertyTypes = [
  { value: 'apartment', icon: Building2, label: 'Apartment' },
  { value: 'house', icon: Home, label: 'House' },
  { value: 'villa', icon: Building2, label: 'Villa' },
  { value: 'pg', icon: Home, label: 'PG/Hostel' },
  { value: 'hostel', icon: Building2, label: 'Hostel' }
];

const amenities = [
  { value: 'wifi', icon: Wifi, label: 'WiFi' },
  { value: 'ac', icon: Snowflake, label: 'Air Conditioning' },
  { value: 'kitchen', icon: ChefHat, label: 'Kitchen' },
  { value: 'parking', icon: Car, label: 'Parking' },
  { value: 'tv', icon: Tv, label: 'TV' }
];

export function FilterSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [locationInput, setLocationInput] = useState<string>('');

  // Initialize state from URL params
  useEffect(() => {
    const amenitiesParam = searchParams.get('amenities');
    if (amenitiesParam) {
      setSelectedAmenities(amenitiesParam.split(','));
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      setPriceRange([
        parseInt(minPrice || '0'),
        parseInt(maxPrice || '100000')
      ]);
    }

    const bedroomsParam = searchParams.get('bedrooms');
    if (bedroomsParam) {
      setBedrooms(parseInt(bedroomsParam));
    }

    // Initialize location input from URL params
    const locationParam = searchParams.get('location');
    setLocationInput(locationParam || '');
  }, [searchParams]);

  // Debounced filter update to prevent excessive API calls
  const debouncedUpdateFilters = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (params: URLSearchParams) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Use replace with scroll: false to prevent auto-scroll
          router.replace(`/?${params.toString()}`, { scroll: false });
        }, 300); // 300ms delay
      };
    })(),
    [router]
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Use debounced update to prevent excessive navigation
    debouncedUpdateFilters(params);
  };

  const handleLocationChange = (value: string) => {
    setLocationInput(value);
    
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set('location', value.trim());
    } else {
      params.delete('location');
    }
    
    // Use debounced update to prevent excessive navigation
    debouncedUpdateFilters(params);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked
      ? [...selectedAmenities, amenity]
      : selectedAmenities.filter(a => a !== amenity);
    
    setSelectedAmenities(newAmenities);
    
    const params = new URLSearchParams(searchParams);
    if (newAmenities.length > 0) {
      params.set('amenities', newAmenities.join(','));
    } else {
      params.delete('amenities');
    }
    
    // Use debounced update to prevent excessive navigation
    debouncedUpdateFilters(params);
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
    
    const params = new URLSearchParams(searchParams);
    if (range[0] > 0) {
      params.set('minPrice', range[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    if (range[1] < 100000) {
      params.set('maxPrice', range[1].toString());
    } else {
      params.delete('maxPrice');
    }
    
    // Use debounced update to prevent excessive navigation
    debouncedUpdateFilters(params);
  };

  const handleBedroomsChange = (value: number[]) => {
    const newBedrooms = value[0];
    setBedrooms(newBedrooms);
    
    const params = new URLSearchParams(searchParams);
    if (newBedrooms > 1) {
      params.set('bedrooms', newBedrooms.toString());
    } else {
      params.delete('bedrooms');
    }
    
    // Use debounced update to prevent excessive navigation
    debouncedUpdateFilters(params);
  };

  const clearFilters = () => {
    setSelectedAmenities([]);
    setPriceRange([0, 100000]);
    setBedrooms(1);
    setLocationInput('');
    
    // Use replace with scroll: false to prevent auto-scroll
    router.replace('/', { scroll: false });
  };

  const hasActiveFilters = searchParams.get('location') || 
                          searchParams.get('minPrice') || 
                          searchParams.get('maxPrice') || 
                          searchParams.get('bedrooms') || 
                          searchParams.get('propertyType') ||
                          searchParams.get('amenities');

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Active Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchParams.get('location') && (
              <Badge variant="secondary" className="gap-1">
                Location: {searchParams.get('location')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleLocationChange('')} />
              </Badge>
            )}
            {searchParams.get('propertyType') && (
              <Badge variant="secondary" className="gap-1">
                Type: {searchParams.get('propertyType')}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('propertyType', '')} />
              </Badge>
            )}
            {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
              <Badge variant="secondary" className="gap-1">
                Price: ₹{searchParams.get('minPrice') || '0'} - ₹{searchParams.get('maxPrice') || '∞'}
                <X className="w-3 h-3 cursor-pointer" onClick={() => {
                  handleFilterChange('minPrice', '');
                  handleFilterChange('maxPrice', '');
                }} />
              </Badge>
            )}
            {searchParams.get('amenities') && (
              <Badge variant="secondary" className="gap-1">
                Amenities: {searchParams.get('amenities')?.split(',').length} selected
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('amenities', '')} />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Location Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Input
          placeholder="City, area, or landmark"
          value={locationInput}
          onChange={(e) => handleLocationChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Trigger immediate search on Enter
              const params = new URLSearchParams(searchParams);
              if (locationInput.trim()) {
                params.set('location', locationInput.trim());
              } else {
                params.delete('location');
              }
              router.replace(`/?${params.toString()}`, { scroll: false });
            }
          }}
        />
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range (₹)</Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            min={0}
            max={100000}
            step={1000}
            className="w-full"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              type="number"
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
            />
            <Input
              placeholder="Max"
              type="number"
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value) || 100000])}
            />
          </div>
        </div>
      </div>

      {/* Bedrooms Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Bedrooms</Label>
        <Slider
          value={[bedrooms]}
          onValueChange={handleBedroomsChange}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="text-center text-sm text-muted-foreground">
          {bedrooms}+ bedrooms
        </div>
      </div>

      {/* Property Type Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Property Type</Label>
        <div className="space-y-2">
          {propertyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={type.value}
                  name="propertyType"
                  value={type.value}
                  checked={searchParams.get('propertyType') === type.value}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <label htmlFor={type.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Icon className="w-4 h-4" />
                  {type.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amenities Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Amenities</Label>
        <div className="space-y-2">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div key={amenity.value} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.value}
                  checked={selectedAmenities.includes(amenity.value)}
                  onCheckedChange={(checked) => handleAmenityChange(amenity.value, checked as boolean)}
                />
                <label htmlFor={amenity.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Icon className="w-4 h-4" />
                  {amenity.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          <Filter className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}