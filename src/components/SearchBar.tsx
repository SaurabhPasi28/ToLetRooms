'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.replace(`/?${params.toString()}`);
  }, 300);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-background border rounded-full shadow-lg p-2 flex items-center">
        {/* Location */}
        <div className="flex-1 px-4 py-2 border-r border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Where to?"
              className="w-full bg-transparent border-none outline-none text-sm"
              defaultValue={searchParams.get('location')?.toString()}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('location', e.target.value);
                } else {
                  params.delete('location');
                }
                router.replace(`/?${params.toString()}`);
              }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex-1 px-4 py-2 border-r border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Check in - Check out"
              className="w-full bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="flex-1 px-4 py-2 border-r border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Add guests"
              className="w-full bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Search Button */}
        <Button className="rounded-full px-6 py-2 ml-2">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Advanced Search (Mobile) */}
      <div className="mt-4 md:hidden">
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Location</label>
            <Input
              placeholder="Where to?"
              defaultValue={searchParams.get('location')?.toString()}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('location', e.target.value);
                } else {
                  params.delete('location');
                }
                router.replace(`/?${params.toString()}`);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Check-in</label>
            <Input type="date" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Check-out</label>
            <Input type="date" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Guests</label>
            <Input placeholder="Number of guests" type="number" min="1" />
          </div>
          <Button className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Search Properties
          </Button>
        </div>
      </div>
    </div>
  );
}