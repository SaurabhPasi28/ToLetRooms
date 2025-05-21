import { Skeleton } from '@/components/ui/skeleton';

export function PropertyLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}