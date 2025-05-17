import PropertyCard from '@/components/property/PropertyCard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Plus } from 'lucide-react';

export default async function HostPropertiesPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p>Please sign in to view your properties</p>
      </div>
    );
  }

  const properties = await Property.find({ host: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Properties</h1>
          <p className="text-muted-foreground">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
          </p>
        </div>
        <Button asChild>
          <Link href="/host/new" className="flex items-center gap-2">
            <Plus size={18} />
            Add New Property
          </Link>
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Home className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Properties Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't listed any properties yet. Get started by adding your first property.
          </p>
          <Button asChild>
            <Link href="/host/new">Create Your First Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard 
              key={property._id.toString()} 
              property={property} 
              editable 
            />
          ))}
        </div>
      )}
    </div>
  );
}