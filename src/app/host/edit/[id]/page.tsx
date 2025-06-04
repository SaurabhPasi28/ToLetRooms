// import PropertyForm from '@/app/host/new/page';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import Property from '@/models/Property';
// import { dbConnect } from '@/lib/dbConnect';
// import { notFound, redirect } from 'next/navigation';

// export default async function EditPropertyPage({
//   params
// }: {
//   params: { id: string }
// }) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     redirect('/login');
//   }

//   const property = await Property.findOne({
//     _id: params.id,
//     host: session.user.id
//   }).lean();

//   if (!property) {
//     notFound();
//   }

//   // Transform for form (convert dates to strings, etc.)
//   const initialData = {
//     ...property,
//     _id: property._id.toString(),
//     host: property.host.toString(),
//     availability: {
//       startDate: property.availability?.startDate?.toISOString().split('T')[0],
//       endDate: property.availability?.endDate?.toISOString().split('T')[0]
//     }
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
//       <PropertyForm initialData={initialData} />
//     </div>
//   );
// }



// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import Property from '@/models/Property';
// import { dbConnect } from '@/lib/dbConnect';
// import { notFound, redirect } from 'next/navigation';
// import PropertyForm from '@/components/property/PropetyFrom';
// import { console } from 'inspector';

// export default async function EditPropertyPage({
//   params
// }: {
//   params: { id: string }
// }) {
//  console.log("---------->session")
// // export default async function EditPropertyPage({
// //   params
// // }: any) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);
//   console.log("---------->session",session)

//   if (!session?.user?.id) {
//     redirect('/login');
//   }
  
//   const property = await Property.findOne({
//     _id: params.id,
//     // media:
//     host: session.user.id
//   }).lean();

//   console.log("---------->property",property)
//   if (!property) {
//     notFound();
//   }

//   // Convert MongoDB object to plain JSON
//   const initialData = JSON.parse(JSON.stringify({
//     ...property,
//     _id: property._id.toString(),
//     host: property.host?.toString?.(),
//     availability: property.availability || {
//       startDate: new Date().toISOString(),
//       endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
//     }
//   }));

//   console.log("---------->property",initialData)
//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
//       <PropertyForm 
//         initialData={initialData}
//         isEditMode={true}
//       />
//     </div>
//   );
// }




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

interface PageProps {
  params: {
    id: string;
  };
}

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