import { Suspense } from 'react';
import { SearchWrapper } from '@/components/SearchWrapper';

export default function HomePage() {
   return (
    <Suspense fallback={<div>Loading...</div>}>
       <SearchWrapper />;
    </Suspense>
  );
}