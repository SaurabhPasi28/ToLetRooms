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



import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import { notFound, redirect } from 'next/navigation';
import PropertyForm from '@/app/host/new/page';

export default async function EditPropertyPage({
  params
}: {
  params: { id: string }
}) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const property = await Property.findOne({
    _id: params.id,
    host: session.user.id
  }).lean();

  if (!property) {
    notFound();
  }

  // Convert MongoDB object to plain JSON
  const initialData = JSON.parse(JSON.stringify({
    ...property,
    _id: property._id.toString(),
    availability: property.availability || {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <PropertyForm 
        initialData={initialData}
        isEditMode={true}
      />
    </div>
  );
}