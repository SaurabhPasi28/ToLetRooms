'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/FilterSidebar';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export function MobileFilterButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const searchParams = useSearchParams();

  // Check for active filters
  useEffect(() => {
    const activeFilters = searchParams.get('location') || 
                         searchParams.get('minPrice') || 
                         searchParams.get('maxPrice') || 
                         searchParams.get('bedrooms') || 
                         searchParams.get('propertyType') ||
                         searchParams.get('amenities');

    const wasActive = hasActiveFilters;
    const isActive = !!activeFilters;

    // If filters just became active, trigger blink effect
    if (!wasActive && isActive) {
      setIsBlinking(true);
      // setTimeout(() => setIsBlinking(false), 3000); // Stop blinking after 3 seconds
    }

    setHasActiveFilters(isActive);
  }, [searchParams, hasActiveFilters]);

  return (
    <>
      {/* Floating Filter Button - Mobile Only */}
      <div className="md:hidden fixed bottom-6 left-10 z-50">
        <div className="relative">
          {/* Blinking Green Ring - Behind the button */}
          {isBlinking && (
            <div className="absolute inset-0 rounded-full animate-ping bg-green-500 pointer-events-none"></div>
          )}
          
          {/* Static Green Ring when filters are active - Behind the button */}
          {hasActiveFilters && (
            <div className="absolute inset-0 rounded-full ring-2 ring-green-500 ring-offset-2 ring-offset-background pointer-events-none"></div>
          )}
          
          {/* Button - On top with pointer events */}
          <Button
            size="lg"
            className="relative z-10 rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90 transition-all duration-300"
            onClick={() => setIsOpen(true)}
          >
            <Filter className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebar isMobile={true} />
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button 
                  className="w-full" 
                  onClick={() => setIsOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}