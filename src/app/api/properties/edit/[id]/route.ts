import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const property = await Property.findOne({
      _id: id,
      host: session.user.id
    }).lean();
    console.log("--------->Propety",property)
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const propertyData = {
      ...property,
      _id: property._id.toString(),
      host: property.host.toString(),
      availability: {
        startDate: property.availability?.startDate?.toISOString().split('T')[0] || '',
        endDate: property.availability?.endDate?.toISOString().split('T')[0] || ''
      }
    };

    return NextResponse.json(propertyData);
  } catch (error) {
    console.error("Error in GET property API:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
