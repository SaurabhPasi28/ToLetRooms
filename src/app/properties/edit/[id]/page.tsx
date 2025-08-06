'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyForm from '@/components/property/PropertyForm';

export default function EditPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the id from params
  const id = params?.id as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchProperty();
    }
  }, [status, router, id]);

  const fetchProperty = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/properties/edit/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        throw new Error('Failed to fetch property');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      router.push('/properties/listed');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The property you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <Button onClick={() => router.push('/properties/listed')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/properties/listed')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Properties
          </Button>
          <h1 className="text-3xl font-bold">Edit Property</h1>
          <p className="text-muted-foreground mt-2">
            Update your property details and images
          </p>
        </div>

        <PropertyForm 
          initialData={property} 
          isEditMode={true} 
        />
      </div>
    </div>
  );
}