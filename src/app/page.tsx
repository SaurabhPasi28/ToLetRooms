import PropertyCard from '@/components/property/PropertyCard';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    propertyType?: string;
  };
}) {
  await dbConnect();

  // Build the filter object based on search params
  const filter: any = { isActive: true };
  
  if (searchParams?.query) {
    filter.$or = [
      { title: { $regex: searchParams.query, $options: 'i' } },
      { description: { $regex: searchParams.query, $options: 'i' } },
    ];
  }

  if (searchParams?.location) {
    filter['address.city'] = { $regex: searchParams.location, $options: 'i' };
  }

  if (searchParams?.minPrice) {
    filter.price = { ...filter.price, $gte: Number(searchParams.minPrice) };
  }

  if (searchParams?.maxPrice) {
    filter.price = { ...filter.price, $lte: Number(searchParams.maxPrice) };
  }

  if (searchParams?.bedrooms) {
    filter.bedrooms = { $gte: Number(searchParams.bedrooms) };
  }

  if (searchParams?.propertyType) {
    filter.propertyType = searchParams.propertyType;
  }

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .then(docs => docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      media: doc.images.map((url: string) => ({
        url,
        type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
      }))
    })));

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section with Search */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-xl mb-6">Discover amazing properties for your next trip</p>
          <SearchBar />
        </div>
      </section>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <FilterSidebar />
        </aside>

        {/* Properties Grid */}
        <section className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Available
            </h2>
            {/* Sorting options can be added here */}
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No properties found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard 
                  key={property._id} 
                  property={property} 
                  editable={false} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}