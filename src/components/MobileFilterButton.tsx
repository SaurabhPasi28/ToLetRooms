'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/FilterSidebar';

export function MobileFilterButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Filter Button - Mobile Only */}
      <div className="md:hidden fixed bottom-6 left-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90"
          onClick={() => setIsOpen(true)}
        >
          <Filter className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
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
                <FilterSidebar />
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
