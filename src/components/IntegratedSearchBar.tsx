'use client';

import { useState } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { SearchSuggestion } from '@/lib/searchService';

interface IntegratedSearchBarProps {
  className?: string;
}

export function IntegratedSearchBar({ className = '' }: IntegratedSearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  // Fetch search suggestions
  const fetchSuggestions = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      // setIsLoading(false);
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
    setIsExpanded(false);
    
    router.replace(`/?${params.toString()}`, { scroll: false });
    window.dispatchEvent(new CustomEvent('search'));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Compact Search Input */}
      {!isExpanded && (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full rounded-full border bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery || locationQuery || ''}
            onClick={() => setIsExpanded(true)}
            readOnly
          />
        </div>
      )}

      {/* Expanded Search Bar */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 p-4 min-w-[600px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Search Properties</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Location Input */}
            <div className="relative">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Where to?"
                  className="flex-1 bg-transparent border-none outline-none text-sm"
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
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => {
                        setLocationQuery(suggestion.value);
                        setLocationSuggestions([]);
                        setShowLocationSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{suggestion.display}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => {
                        setSearchQuery(suggestion.value);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
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

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSearch} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
