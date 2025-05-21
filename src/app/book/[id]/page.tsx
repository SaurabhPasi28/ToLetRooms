import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import BookingConfirmation from '@/components/booking/BookingConfirmation';

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect(`/login?callbackUrl=/book/${params.id}`);
  }

  // Validate search params
  if (!searchParams.checkIn || !searchParams.checkOut || !searchParams.guests) {
    return redirect(`/properties/${params.id}`);
  }

  const property = await Property.findById(params.id)
    .lean()
    .then(doc => {
      if (!doc) return null;
      return {
        ...doc,
        _id: doc._id.toString(),
        media: doc.images.map((url: string) => ({
          url,
          type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
        })),
        host: {
          ...doc.host,
          _id: doc.host._id.toString()
        }
      };
    });

  if (!property) {
    return redirect('/');
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <BookingConfirmation 
        property={property}
        checkIn={new Date(searchParams.checkIn as string)}
        checkOut={new Date(searchParams.checkOut as string)}
        guests={Number(searchParams.guests)}
        user={session.user}
      />
    </main>
  );
}