'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Filters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    // params.set('minPrice', priceRange[0]);
    // params.set('maxPrice', priceRange[1]);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="font-semibold mb-4">Filters</h3>
      
      <div className="mb-4">
        <label className="block mb-2">Price range</label>
        <input
          type="range"
          min="0"
          max="10000"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>
      
      {/* Add more filters for Indian address fields */}
      
      
      <button
        onClick={applyFilters}
        className="bg-rose-500 text-white px-4 py-2 rounded"
      >
        Apply Filters
      </button>
    </div>
  );
}