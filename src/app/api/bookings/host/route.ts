import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';

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
    const includeAnalytics = searchParams.get('analytics') === 'true';

    // Get properties owned by this user (no role check, just ownership)
    const properties = await Property.find({ host: user.id }).select('_id');
    const propertyIds = properties.map((p: any) => p._id);

    if (propertyIds.length === 0) {
      return NextResponse.json({ 
        bookings: [], 
        total: 0,
        analytics: null,
        message: 'No properties found for this user'
      });
    }

    const query: any = { property: { $in: propertyIds } };

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

    // Fetch bookings for properties owned by this user
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
        const guestInfo = b.guestInfo || {};
        const user = b.user || {};
        const property = b.property || {};
        
        return (
          (property.title || '').toLowerCase().includes(searchTerm) ||
          (property.address?.city || '').toLowerCase().includes(searchTerm) ||
          (property.address?.state || '').toLowerCase().includes(searchTerm) ||
          (guestInfo.name || user.name || '').toLowerCase().includes(searchTerm) ||
          (guestInfo.email || user.email || '').toLowerCase().includes(searchTerm) ||
          (guestInfo.phone || user.phone || '').toLowerCase().includes(searchTerm) ||
          (b.bookingCode || '').toLowerCase().includes(searchTerm)
        );
      });
    }

    // Normalize data
    const normalized = bookings.map((b: any) => ({
      ...b,
      guestDetails: b.guestInfo || {
        name: b.user?.name || 'Unknown Guest',
        email: b.user?.email || 'no-email@example.com',
        phone: b.user?.phone || 'No phone'
      },
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

    let analytics = null;
    if (includeAnalytics) {
      analytics = await getHostAnalytics(user.id);
    }

    return NextResponse.json({ 
      bookings: normalized, 
      total: await Booking.countDocuments(query),
      analytics
    });
    
  } catch (error) {
    console.error('Fetch host bookings error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch host bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getHostAnalytics(hostId: string) {
  try {
    const properties = await Property.find({ host: hostId }).select('_id');
    const propertyIds = properties.map((p: any) => p._id);

    if (propertyIds.length === 0) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: [],
        statusCounts: {},
        recentBookings: 0,
        properties: 0,
        averageBookingValue: 0,
        cancellationRate: 0
      };
    }

    const [
      totalBookings,
      totalRevenue,
      monthlyRevenue,
      statusCounts,
      recentBookings,
      totalCancellations
    ] = await Promise.all([
      // Total bookings
      Booking.countDocuments({ property: { $in: propertyIds } }),
      
      // Total revenue from confirmed/completed bookings
      Booking.aggregate([
        { $match: { property: { $in: propertyIds }, status: { $in: ['confirmed', 'completed', 'checked_out'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      
      // Monthly revenue (last 12 months)
      Booking.aggregate([
        { 
          $match: { 
            property: { $in: propertyIds },
            status: { $in: ['confirmed', 'completed', 'checked_out'] },
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalPrice' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Status counts
      Booking.aggregate([
        { $match: { property: { $in: propertyIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Recent bookings (last 30 days)
      Booking.countDocuments({
        property: { $in: propertyIds },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Cancellations
      Booking.countDocuments({
        property: { $in: propertyIds },
        status: 'cancelled'
      })
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const averageBookingValue = totalBookings > 0 ? revenue / totalBookings : 0;
    const cancellationRate = totalBookings > 0 ? (totalCancellations / totalBookings) * 100 : 0;

    return {
      totalBookings,
      totalRevenue: revenue,
      monthlyRevenue,
      statusCounts: statusCounts.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentBookings,
      properties: properties.length,
      averageBookingValue: Math.round(averageBookingValue),
      cancellationRate: Math.round(cancellationRate * 100) / 100
    };
  } catch (error) {
    console.error('Analytics error:', error);
    return null;
  }
}