'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
    <div className="relative max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder="Search properties..."
        className="pl-10 pr-4 py-6 text-base"
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}