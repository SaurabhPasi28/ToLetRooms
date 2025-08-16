import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import User from '@/models/User';
import { dbConnect } from '@/lib/dbConnect';
import { sendBookingNotification } from '@/lib/mail';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string };
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      propertyId, 
      checkIn, 
      checkOut, 
      guests, 
      guestInfo,
      specialRequests,
      totalPrice,
      basePrice,
      serviceFee,
      cleaningFee,
      taxes
    } = await req.json();

    // Validation
    if (!propertyId || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (!checkInDate || !checkOutDate || isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
    }

    if (!Number.isFinite(guests) || guests <= 0) {
      return NextResponse.json({ error: 'Invalid guests count' }, { status: 400 });
    }

    if (!guestInfo || !guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      return NextResponse.json({ error: 'Guest information is required' }, { status: 400 });
    }

    // Fetch property
    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (String(property.host) === user.id) {
      return NextResponse.json({ error: 'Hosts cannot book their own property' }, { status: 400 });
    }

    if (guests > property.maxGuests) {
      return NextResponse.json({ error: `Max guests allowed is ${property.maxGuests}` }, { status: 400 });
    }

    // Check availability
    const overlapping = await Booking.findOne({
      property: propertyId,
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    if (overlapping) {
      return NextResponse.json({ error: 'Property is not available for these dates.' }, { status: 409 });
    }

    // Get client info for security
    const headers = req.headers;
    const ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
    const userAgent = headers.get('user-agent') || 'unknown';

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      user: user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      guestInfo,
      specialRequests,
      basePrice: basePrice || totalPrice,
      serviceFee: serviceFee || 0,
      cleaningFee: cleaningFee || 0,
      taxes: taxes || 0,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending',
      ipAddress,
      userAgent,
      statusHistory: [
        { 
          status: 'pending', 
          byRole: 'tenant', 
          byUserId: user.id,
          at: new Date(), 
          note: 'Booking created' 
        }
      ]
    });

    // Send notifications (non-blocking)
    try {
      const propertyDoc = await Property.findById(propertyId).populate('host');
      const owner = propertyDoc?.host ? await User.findById(propertyDoc.host) : null;
      if (owner?.email) {
        await sendBookingNotification(owner.email, propertyDoc!.title, {
          checkIn, checkOut, guests, totalPrice, 
          guestInfo,
          bookingId: booking._id,
          user: { id: user.id }
        });
      }
    } catch (e) {
      console.error('sendBookingNotification failed:', e);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string };
  
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // TENANT VIEW: Get bookings made by this user (no role check)
    const query: any = { user: user.id };

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        query.checkIn = { $gt: new Date() };
        query.status = { $in: ['confirmed', 'pending'] };
      } else if (status === 'active') {
        const now = new Date();
        query.checkIn = { $lte: now };
        query.checkOut = { $gt: now };
        query.status = { $in: ['confirmed', 'checked_in'] };
      } else if (status === 'past') {
        query.checkOut = { $lt: new Date() };
      } else if (status === 'cancelled') {
        query.status = 'cancelled';
      } else {
        query.status = status;
      }
    }

    // Apply date range filter
    if (from || to) {
      query.checkIn = query.checkIn || {};
      if (from) query.checkIn.$gte = new Date(from);
      if (to) query.checkIn.$lte = new Date(to);
    }

    // Fetch bookings made by this user
    let bookings = await Booking.find(query)
      .populate({ 
        path: 'property', 
        select: 'title media address price host maxGuests bedrooms bathrooms amenities isActive',
        populate: { path: 'host', select: 'name email phone profilePicture' }
      })
      .populate({ path: 'user', select: 'name email phone profilePicture' })
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Search filter
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      bookings = bookings.filter((b: any) => {
        const property = b.property || {};
        
        return (
          (property.title || '').toLowerCase().includes(searchTerm) ||
          (property.address?.city || '').toLowerCase().includes(searchTerm) ||
          (property.address?.state || '').toLowerCase().includes(searchTerm) ||
          (b.bookingCode || '').toLowerCase().includes(searchTerm)
        );
      });
    }

    // Normalize data for tenant view
    const normalized = bookings.map((b: any) => ({
      ...b,
      property: b.property ? {
        ...b.property,
        media: Array.isArray(b.property.media)
          ? b.property.media.map((url: string) => ({ 
              url, 
              type: /\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i.test(url) ? 'video' : 'image' 
            }))
          : []
      } : null,
      nights: Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
      isUpcoming: new Date(b.checkIn) > new Date() && ['confirmed', 'pending'].includes(b.status),
      isActive: (() => {
        const now = new Date();
        return new Date(b.checkIn) <= now && new Date(b.checkOut) > now && ['confirmed', 'checked_in'].includes(b.status);
      })(),
      isPast: new Date(b.checkOut) < new Date() || ['completed', 'checked_out'].includes(b.status),
      canBeCancelled: ['pending', 'confirmed'].includes(b.status) && new Date(b.checkIn) > new Date()
    }));

    return NextResponse.json({ 
      bookings: normalized, 
      total: await Booking.countDocuments(query)
    });
    
  } catch (error) {
    console.error('Fetch tenant bookings error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

