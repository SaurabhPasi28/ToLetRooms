
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: string };
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await req.json();
    console.log("--------------->rawData",rawData)

    const propertyData = {
      ...rawData,
      host: new mongoose.Types.ObjectId(user.id),
      media: rawData.media || []
    };

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const property = await Property.create(propertyData);
    return NextResponse.json(property, { status: 201 });

  } catch (error:any) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Server error',
        // details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : []
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as { id: string };
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await Property.find({ host:user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(properties);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}