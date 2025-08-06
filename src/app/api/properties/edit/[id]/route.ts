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

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Serialize the property data
    const propertyData = {
      _id: property._id.toString(),
      title: property.title,
      description: property.description,
      price: property.price,
      propertyType: property.propertyType,
      address: {
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        pinCode: property.address.pinCode,
        areaOrLocality: property.address.areaOrLocality || '',
        houseNumber: property.address.houseNumber || ''
      },
      media: property.media || [],
      amenities: property.amenities || [],
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      isActive: property.isActive,
      host: property.host.toString(),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
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