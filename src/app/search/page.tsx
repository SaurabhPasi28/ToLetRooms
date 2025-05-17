import { searchProperties } from '@/lib/data';
import { Suspense } from 'react';
import PropertyGrid from '@/components/PropertyGrid';
import Filters from '@/components/Filters';
import PropertyGridSkeleton from '@/components/PropertyGridSkeleton';

export default async function SearchPage({ searchParams }) {
  const properties = await searchProperties(searchParams);
  
  return (
    <div className="container mx-auto px-4 py-8">

        
      <Filters />
      {/* <PropertyGrid properties={properties} /> */}
      
      <Suspense fallback={<PropertyGridSkeleton />}>
  <PropertyGrid properties={properties} />
</Suspense>
    </div>
  );
}