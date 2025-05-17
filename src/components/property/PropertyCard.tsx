"use client"
import { Calendar, MapPin, Star, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PropertyCard({property, editable = false}: { property: any;editable?: boolean;}) {
    const router = useRouter();
    const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {

        const deleteImagePromises = property.images.map(async (imageUrl:string) => {
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (!publicId) return;
        
        await fetch('/api/sign-upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId })
        });
      });

      await Promise.all(deleteImagePromises);

        const response = await fetch(`/api/properties/${property._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Property deleted');
          router.refresh(); // Refresh the page to show updated list
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        toast.error('Failed to delete property');
      }
    }
  };
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-video bg-gray-100">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {property.isActive ? 'Active' : 'Draft'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            {property.address.city}, {property.address.state}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {property.maxGuests} guests
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {property.bedrooms} beds
          </div>
          <div className="flex items-center gap-1">
            ₹{property.price}/night
          </div>
        </div>
        
        {editable && (
          <div className="flex gap-2 mt-4">
        <Link
          href={`/host/edit/${property._id}`}
          className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
        >
          Edit
        </Link>
        <button 
          onClick={handleDelete}
          className="text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
        >
          Delete
        </button>
      </div>
        )}
      </div>
    </div>
  );
}



