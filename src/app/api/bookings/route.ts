import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Booking from '@/models/Booking';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string };
  if (!user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { propertyId, checkIn, checkOut, guests, totalPrice } = await req.json();

    const booking = await Booking.create({
      property: propertyId,
      user: user.id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      totalPrice,
      status: 'confirmed'
    });

    // TODO: Add payment processing logic here
    // TODO: Send confirmation email

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}