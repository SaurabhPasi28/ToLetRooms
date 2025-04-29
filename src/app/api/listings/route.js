import { dbConnect } from '@/lib/dbConnect';
import Listing from '@/models/Listing';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  const listings = await Listing.find();
  return NextResponse.json(listings);
}

export async function POST(request) {
    await dbConnect();
    const body = await request.json();
    const listing = await Listing.create(body);
    return NextResponse.json(listing);
  }