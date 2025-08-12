'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { SearchSuggestion } from '@/lib/searchService';

export function ScrollSearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show search bar when scrolled beyond first screen height
      const shouldShow = scrollTop > windowHeight;
      console.log('Scroll position:', scrollTop, 'Window height:', windowHeight, 'Should show:', shouldShow);
      setIsVisible(shouldShow);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch search suggestions
  const fetchSuggestions = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Fetch location suggestions
  const fetchLocationSuggestions = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&type=location`);
      if (response.ok) {
        const data = await response.json();
        setLocationSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  }, 300);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    
    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }
    
    if (locationQuery) {
      params.set('location', locationQuery);
    } else {
      params.delete('location');
    }
    
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
    
    router.replace(`/?${params.toString()}`, { scroll: false });
    window.dispatchEvent(new CustomEvent('search'));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle suggestion selection with auto-search
  const handleSuggestionSelect = (suggestion: SearchSuggestion, type: 'search' | 'location') => {
    if (type === 'search') {
      setSearchQuery(suggestion.value);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      setLocationQuery(suggestion.value);
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
    
    // Auto-trigger search after a short delay to ensure state is updated
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.scroll-search-container')) {
        setShowSuggestions(false);
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  console.log('ScrollSearchBar isVisible:', isVisible);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop: Search bar inside navbar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b shadow-sm transition-all duration-300 scroll-search-container">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo placeholder to maintain layout */}
            <div className="w-32"></div>
            
            {/* Search Bar in center */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="bg-background border rounded-full shadow-lg p-2 flex items-center">
                {/* Location Search */}
                <div className="flex-1 px-4 py-2 border-r border-border relative">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      className="w-full bg-transparent border-none outline-none text-sm"
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        fetchLocationSuggestions(e.target.value);
                        setShowLocationSuggestions(true);
                      }}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSuggestionSelect(suggestion, 'location')}
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span>{suggestion.display}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Property Search */}
                <div className="flex-1 px-4 py-2 border-r border-border relative">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search properties..."
                      className="w-full bg-transparent border-none outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        fetchSuggestions(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyPress={handleKeyPress}
                    />
                    {isLoading && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                  </div>
                  
                  {/* Search Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSuggestionSelect(suggestion, 'search')}
                        >
                          <div className="flex items-center justify-between">
                            <span>{suggestion.display}</span>
                            <span className="text-xs text-muted-foreground capitalize">{suggestion.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <Button 
                  className="rounded-full px-6 py-2 ml-2"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: Search bar below navbar */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b shadow-sm transition-all duration-300 scroll-search-container">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-4xl mx-auto">
              <div className="bg-background border rounded-full shadow-lg p-2 flex items-center">
                {/* Location Search */}
                <div className="flex-1 px-4 py-2 border-r border-border relative">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Where to?"
                      className="w-full bg-transparent border-none outline-none text-sm"
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        fetchLocationSuggestions(e.target.value);
                        setShowLocationSuggestions(true);
                      }}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  
                  {/* Location Suggestions */}
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSuggestionSelect(suggestion, 'location')}
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span>{suggestion.display}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Property Search */}
                <div className="flex-1 px-4 py-2 border-r border-border relative">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search properties..."
                      className="w-full bg-transparent border-none outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        fetchSuggestions(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyPress={handleKeyPress}
                    />
                    {isLoading && <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                  </div>
                  
                  {/* Search Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                          onClick={() => handleSuggestionSelect(suggestion, 'search')}
                        >
                          <div className="flex items-center justify-between">
                            <span>{suggestion.display}</span>
                            <span className="text-xs text-muted-foreground capitalize">{suggestion.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <Button 
                  className="rounded-full ml-1"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className=" text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}