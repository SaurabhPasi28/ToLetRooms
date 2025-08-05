import PropertyCard from '@/components/property/PropertyCard';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { MapPin, Star, TrendingUp, Shield, Heart } from 'lucide-react';

export default async function HomePage({
  searchParams,
}: any) {
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
      media: doc.media?.map((url: string) => ({
        url,
        type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
      }))
    })));

  return (
    <div className="bg-background">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find Your Perfect
              <span className="text-primary block">Stay</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover amazing properties for your next trip. From cozy apartments to luxury villas, 
              find the perfect accommodation that fits your style and budget.
            </p>
            <SearchBar />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Prime Locations</h3>
              <p className="text-muted-foreground">Properties in the most sought-after locations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Verified Properties</h3>
              <p className="text-muted-foreground">All properties are verified and safe</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
              <p className="text-muted-foreground">Competitive prices for every budget</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-1/4">
              <div className="sticky top-24">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  <FilterSidebar />
                </div>
              </div>
            </aside>

            {/* Properties Grid */}
            <section className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Available
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Find the perfect place for your next adventure
                  </p>
                </div>
                <Button variant="outline" className="hidden md:flex">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Sort by
                </Button>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-foreground">No properties found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters to find what you're looking for
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={{
                        ...property,
                        media: property.media.map((m) => ({
                          ...m,
                          type: m.type as "image" | "video"
                        })),
                      }}
                      editable={false}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {properties.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" size="lg">
                    Load More Properties
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}