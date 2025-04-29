import { dbConnect } from '@/lib/dbConnect';
import Listing from '@/models/Listing';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const listing = await Listing.create(body);
    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}