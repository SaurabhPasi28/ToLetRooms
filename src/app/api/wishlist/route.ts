import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {dbConnect} from '@/lib/dbConnect';
import Wishlist from '@/models/Wishlist';
import Property from '@/models/Property';

// GET - Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const wishlistItems = await Wishlist.find({ userId: session.user.id })
      .populate({
        path: 'propertyId',
        model: Property,
        select: 'title media address maxGuests bedrooms price isActive'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Serialize the data properly
    const serializedWishlist = wishlistItems.map(item => ({
      // _id: item._id.toString(),
      userId: item.userId.toString(),
      propertyId: item.propertyId ? {
        _id: item.propertyId._id.toString(),
        title: item.propertyId.title,
        media: item.propertyId.media || [],
        address: item.propertyId.address,
        maxGuests: item.propertyId.maxGuests,
        bedrooms: item.propertyId.bedrooms,
        price: item.propertyId.price,
        isActive: item.propertyId.isActive
      } : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    })).filter(item => item.propertyId !== null); // Filter out items with deleted properties

    return NextResponse.json({ wishlist: serializedWishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add property to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await request.json();
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      userId: session.user.id,
      propertyId
    });

    if (existingWishlist) {
      return NextResponse.json({ error: 'Property already in wishlist' }, { status: 400 });
    }

    const wishlistItem = new Wishlist({
      userId: session.user.id,
      propertyId
    });

    await wishlistItem.save();

    return NextResponse.json({ 
      message: 'Property added to wishlist',
      wishlistItem: {
        _id: wishlistItem._id.toString(),
        userId: wishlistItem.userId.toString(),
        propertyId: wishlistItem.propertyId.toString(),
        createdAt: wishlistItem.createdAt,
        updatedAt: wishlistItem.updatedAt
      }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove property from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    await dbConnect();

    const deletedItem = await Wishlist.findOneAndDelete({
      userId: session.user.id,
      propertyId
    });

    if (!deletedItem) {
      return NextResponse.json({ error: 'Property not found in wishlist' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Property removed from wishlist' 
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}