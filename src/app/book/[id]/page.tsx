// // import type { Property as PropertyType } from '@/types/property'; // optional: if you have a TS interface
// import { redirect } from 'next/navigation';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import Property from '@/models/Property';
// import { dbConnect } from '@/lib/dbConnect';
// import BookingConfirmation from '@/components/booking/BookingConfirmation';

// // export default async function BookingPage({
// //   params,
// //   searchParams,
// // }: {
// //   params: { id: string };
// //   searchParams: { [key: string]: string | string[] | undefined };
// // }) {

// export default async function BookingPage({
//   params,
//   searchParams,
// }: any) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);

//   console.log("------------------>session.user1",session.user)

//   const user = session?.user as { id: string };
//   if (!user?.id) {
//     return redirect(`/login?callbackUrl=/book/${params.id}`);
//   }

//   // Validate search params
//   // if (!searchParams.checkIn || !searchParams.checkOut || !searchParams.guests) {
//   //   return redirect(`/properties/${params.id}`);
//   // }
//   console.log("------------------>session.user2",session.user)

// const property = await Property.findById(params.id)
//   .lean<any>() // type-safe lean
//   .then(doc => {
//     if (!doc) return null;

//     return {
//       ...doc,
//       _id: doc._id.toString(),
//       media: (doc.media || []).map((url: string) => ({
//         url,
//         type: /\.(mp4|mov|avi|webm)$/i.test(url) ? 'video' : 'image',
//       })),
//       host: {
//         ...doc.host,
//         _id: doc.host?._id?.toString?.() || '', // prevent crash if host is not populated
//       },
//     };
//   });
//   console.log("------------------>session.user3",session.user)
// if (!property) {
//   return redirect('/');
// }

//   return (
//     <main className="container mx-auto px-4 py-8">
//       <BookingConfirmation 
//         property={property}
//         checkIn={new Date(searchParams.checkIn as string)}
//         checkOut={new Date(searchParams.checkOut as string)}
//         guests={Number(searchParams.guests)}
//         user={session?.user}
//       />
//     </main>
//   );
// }

import React from 'react'

function page() {
  return (
    <div>
      Book Page
    </div>
  )
}

export default page
