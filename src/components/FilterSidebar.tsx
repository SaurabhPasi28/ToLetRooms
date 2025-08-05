'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Home, Building2, Mountain, Umbrella, TreePine } from 'lucide-react';

const propertyTypes = [
  { value: 'Apartment', icon: Building2, label: 'Apartment' },
  { value: 'House', icon: Home, label: 'House' },
  { value: 'Villa', icon: Building2, label: 'Villa' },
  { value: 'Cabin', icon: TreePine, label: 'Cabin' },
  { value: 'Beachfront', icon: Umbrella, label: 'Beachfront' },
  { value: 'Countryside', icon: Mountain, label: 'Countryside' }
];

export function FilterSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    router.replace('/');
  };

  const hasActiveFilters = searchParams.get('location') || 
                          searchParams.get('minPrice') || 
                          searchParams.get('maxPrice') || 
                          searchParams.get('bedrooms') || 
                          searchParams.get('propertyType');

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
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('location', '')} />
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
          </div>
        </div>
      )}

      {/* Location Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Input
          placeholder="City or area"
          defaultValue={searchParams.get('location')?.toString()}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range (₹)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            defaultValue={searchParams.get('minPrice')?.toString()}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
          <Input
            placeholder="Max"
            type="number"
            defaultValue={searchParams.get('maxPrice')?.toString()}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Bedrooms Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Bedrooms</Label>
        <Slider
          defaultValue={[Number(searchParams.get('bedrooms')) || 1]}
          min={1}
          max={10}
          step={1}
          onValueChange={(value) => handleFilterChange('bedrooms', value[0].toString())}
          className="w-full"
        />
        <div className="text-center text-sm text-muted-foreground">
          {searchParams.get('bedrooms') || 1}+ bedrooms
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