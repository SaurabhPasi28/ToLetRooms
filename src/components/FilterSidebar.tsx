'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const propertyTypes = [
  'Apartment',
  'House',
  'Villa',
  'Cabin',
  'Beachfront',
  'Countryside'
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Location</h3>
        <Input
          placeholder="City or area"
          defaultValue={searchParams.get('location')?.toString()}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="flex gap-2 mb-2">
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

      <div>
        <h3 className="font-medium mb-3">Bedrooms</h3>
        <Slider
          defaultValue={[Number(searchParams.get('bedrooms')) || 1]}
          min={1}
          max={10}
          step={1}
          onValueChange={(value) => handleFilterChange('bedrooms', value[0].toString())}
        />
        <div className="text-center mt-2">
          {searchParams.get('bedrooms') || 1}+ bedrooms
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Property Type</h3>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <input
                type="radio"
                id={type}
                name="propertyType"
                value={type}
                checked={searchParams.get('propertyType') === type}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="h-4 w-4"
              />
              <label htmlFor={type}>{type}</label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => router.replace('/')}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );
}