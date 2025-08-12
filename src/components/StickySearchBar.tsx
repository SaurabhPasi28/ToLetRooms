'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StickySearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  // const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // setIsScrolled(scrollTop > 100);
      
      // Show search bar when scrolled down
      if (scrollTop > 200) {
        setIsSearchVisible(true);
      } else {
        setIsSearchVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search toggle
  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Scroll to top when opening search
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  return (
    <>
      {/* Compact Search Bar - Always visible when scrolled */}
      {isSearchVisible && !isExpanded && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b shadow-sm transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search properties, locations, amenities..."
                    className="w-full rounded-full border bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onClick={toggleSearch}
                    readOnly
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearch}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Search Bar */}
      {isExpanded && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b shadow-lg transition-all duration-300 search-container">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search Properties</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearch}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SearchBar className="w-full" showAdvanced={false} />
          </div>
        </div>
      )}

      {/* Floating Search Button - Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0"
          onClick={toggleSearch}
        >
          <Search className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
