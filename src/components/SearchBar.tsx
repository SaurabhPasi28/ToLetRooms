'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin,Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { SearchSuggestion } from '@/lib/searchService';

interface SearchBarProps {
  className?: string;
  showAdvanced?: boolean;
}

export function SearchBar({ className = '', showAdvanced = false }: SearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(showAdvanced);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [locationSuggestions, setLocationSuggestions] = useState<SearchSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Emit custom search event
  const emitSearchEvent = () => {
    window.dispatchEvent(new CustomEvent('search'));
  };

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

  // Handle search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  // Handle location query changes
  const handleLocationChange = (value: string) => {
    setLocationQuery(value);
    fetchLocationSuggestions(value);
    setShowLocationSuggestions(true);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    setSuggestions([]);
    setShowSuggestions(false);
    
    const params = new URLSearchParams(searchParams);
    params.set('query', suggestion.value);
    
    // Use replace with scroll: false to prevent auto-scroll
    router.replace(`/?${params.toString()}`, { scroll: false });
    
    // Emit search event
    emitSearchEvent();
  };

  // Handle location suggestion selection
  const handleLocationSuggestionSelect = (suggestion: SearchSuggestion) => {
    setLocationQuery(suggestion.value);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    
    const params = new URLSearchParams(searchParams);
    params.set('location', suggestion.value);
    
    // Use replace with scroll: false to prevent auto-scroll
    router.replace(`/?${params.toString()}`, { scroll: false });
    
    // Emit search event
    emitSearchEvent();
  };

  // Handle search submission
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
    
    // Use replace with scroll: false to prevent auto-scroll
    router.replace(`/?${params.toString()}`, { scroll: false });
    
    // Emit search event
    emitSearchEvent();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="bg-background border rounded-full shadow-lg p-2 flex items-center  border-blue-700">
        {/* Location Search */}
        <div className="w-[30%] px-4 py-2 border-r border-border relative" ref={locationRef}>
          <div className="flex items-center gap-2 ">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Where to?"
              className="w-full bg-transparent border-none outline-none text-sm"
              value={locationQuery}
              onChange={(e) => handleLocationChange(e.target.value)}
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
                  onClick={() => handleLocationSuggestionSelect(suggestion)}
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

        {/* Property Search */}
        <div className="flex-1 px-4 py-2 border-r border-border relative" ref={searchRef}>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full bg-transparent border-none outline-none text-sm"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => handleSuggestionSelect(suggestion)}
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

        {/* Dates */}
        {/* <div className="flex-1 px-4 py-2 border-r border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Check in - Check out"
              className="w-full bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div> */}

        {/* Guests */}
        {/* <div className="flex-1 px-4 py-2 border-r border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Add guests"
              className="w-full bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div> */}

        {/* Search Button */}
        <Button 
          className="rounded-full px-6 py-2 ml-2"
          onClick={handleSearch}
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Advanced Search Toggle */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Hide' : 'Show'} Advanced Search
        </Button>
      </div>

      {/* Advanced Search (Mobile) */}
      {isExpanded && (
        <div className="mt-4 md:hidden">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                placeholder="Where to?"
                value={locationQuery}
                onChange={(e) => handleLocationChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Search</label>
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
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
            <Button className="w-full" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search Properties
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}