import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Booking from '@/models/Booking';
import { dbConnect } from '@/lib/dbConnect';
import BookingCard from '@/components/booking/BookingCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function BookingsPage() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/login?callbackUrl=/bookings');
  }

  const bookings = await Booking.find({ user: session.user.id })
    .populate('property')
    .sort({ checkIn: -1 })
    .lean()
    .then(docs => docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      property: {
        ...doc.property,
        _id: doc.property._id.toString(),
        media: doc.property.images.map((url: string) => ({
          url,
          type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
        }))
      },
      checkIn: doc.checkIn.toISOString(),
      checkOut: doc.checkOut.toISOString()
    })));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Bookings</h1>
        <Button asChild>
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t made any bookings yet. Start exploring properties to book your stay.
          </p>
          <Button asChild>
            <Link href="/properties">Find Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}