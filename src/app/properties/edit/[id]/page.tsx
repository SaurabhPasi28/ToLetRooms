'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/property/PropetyFrom';

interface PropertyData {
  _id: string;
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'villa' | 'pg' | 'hostel';
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
    areaOrLocality?: string;
    houseNumber?: string;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities?: string[];
  media: string[];
  availability?: {
    startDate?: string;
    endDate?: string;
  };
  host: string;
}

// interface PageProps {
//   params: {
//     id: string;
//   };
// }

export default function EditPropertyPage({ params }: any) {
  const router = useRouter();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperty();
  }, [params.id]); // Added params.id as dependency

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/edit/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/404');
          return;
        }
        throw new Error('Failed to fetch property');
      }

      const data = await response.json();
      setProperty(data);
    } catch (err) {
      console.error("Error fetching property:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      router.push('/error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-500">{error}</div>;
  }

  if (!property) {
    return <div className="container mx-auto py-8">Property not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <PropertyForm 
        initialData={property} 
        isEditMode={true} 
      />
    </div>
  );
}