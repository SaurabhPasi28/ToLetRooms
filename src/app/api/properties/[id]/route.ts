import {NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
// import { Types } from 'mongoose';

// import mongoose from 'mongoose';

export async function DELETE(
  req: Request,
  { params }:any
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
const user = session?.user as { id: string };
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await Property.findOneAndDelete({
      _id: params.id,
      host:user.id
    });

    if (!deleted) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request,{ params }: any) {
  await dbConnect();
  const session = await getServerSession(authOptions);
const user = session?.user as { id: string };
  if (!user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    const updated = await Property.findOneAndUpdate(
      {
        _id: params.id,
        host: user.id
      },
      data,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error:any) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}



