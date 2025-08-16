'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import PropertyForm from '@/components/property/PropertyForm';

export default function EditPropertyPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const id = params?.id as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && id) {
      fetchProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, id]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/edit/${id}`);
      if (!res.ok) throw new Error('Failed to fetch property');
      const data = await res.json();
      setProperty(data);
    } catch {
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
            The property you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
          </p>
          <button
            onClick={() => router.push('/properties/listed')}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-6">
      <PropertyForm initialData={property} isEditMode />
    </div>
  );
}