import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Booking from '@/models/Booking';
import { dbConnect } from '@/lib/dbConnect';

// Define proper types for populated booking
interface PopulatedBooking {
  _id: string;
  property: {
    _id: string;
    title: string;
    media: string[];
    address?: {
      city?: string;
      state?: string;
      street?: string;
      pinCode?: string;
    };
    price: number;
    host: {
      _id: string;
      name?: string;
      email?: string;
      phone?: string;
      profilePicture?: string;
    };
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    isActive?: boolean;
  };
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };
  checkIn: string | Date;
  checkOut: string | Date;
  guests: number;
  totalPrice: number;
  basePrice?: number;
  serviceFee?: number;
  cleaningFee?: number;
  taxes?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in' | 'checked_out' | 'no_show';
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
  specialRequests?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  statusHistory?: Array<{
    status: string;
    at: Date;
    byRole: string;
    byUserId?: string;
    note?: string;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// GET /api/bookings/[id] - Fetch individual booking details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string };
  console.log("working til here---------->1")
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking with full population (without .lean() first)
    console.log("working til here---------->12222",id)
    const bookingDoc = await Booking.findById(id)
      .populate({
        path: 'property',
        select: 'title media address price host maxGuests bedrooms bathrooms amenities isActive',
        populate: { path: 'host', select: 'name email phone profilePicture' }
      })
      .populate({ path: 'user', select: 'name email phone profilePicture' });
      console.log("working til here---------->1333333")
    if (!bookingDoc) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
console.log("working til here---------->2")
    // Convert to plain object and cast to our type
    const booking = bookingDoc.toObject() as PopulatedBooking;
    console.log("working til here---------->3")

    // Check if user has access to this booking
    const isCurrentUserTenant = String(booking.user._id) === user.id;
    const isCurrentUserHost = booking.property?.host?._id ? String(booking.property.host._id) === user.id : false;

    // if (!isCurrentUserTenant && !isCurrentUserHost) {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    // }

    // Normalize media
    const normalizedProperty = booking.property ? {
      ...booking.property,
      media: Array.isArray(booking.property.media)
        ? booking.property.media.map((url: string) => ({ 
            url, 
            type: /\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i.test(url) ? 'video' as const : 'image' as const
          }))
        : [],
      host: booking.property.host ? {
        _id: String(booking.property.host._id),
        name: booking.property.host.name || '',
        email: booking.property.host.email || '',
        phone: booking.property.host.phone || '',
        avatar: booking.property.host.profilePicture || null
      } : null
    } : null;

    // Add computed fields
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    
    const normalizedBooking = {
      ...booking,
      property: normalizedProperty,
      nights: Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)),
      isUpcoming: checkInDate > new Date() && ['confirmed', 'pending'].includes(booking.status),
      isActive: (() => {
        const now = new Date();
        return checkInDate <= now && checkOutDate > now && ['confirmed', 'checked_in'].includes(booking.status);
      })(),
      isPast: checkOutDate < new Date() || ['completed', 'checked_out'].includes(booking.status),
      canBeCancelled: ['pending', 'confirmed'].includes(booking.status) && checkInDate > new Date(),
      isCurrentUserTenant,
      isCurrentUserHost
    };

    return NextResponse.json({ booking: normalizedBooking });
    
  } catch (error) {
    console.error('Fetch booking error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch booking --->',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string };
  
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, paymentStatus, note } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking with property (without .lean() to get proper types)
    const bookingDoc = await Booking.findById(id).populate('property');
    if (!bookingDoc) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Convert to plain object for easier manipulation
    const booking = bookingDoc.toObject() as PopulatedBooking;
    
    // Check user permissions
    const isCurrentUserHost = booking.property?.host ? String(booking.property.host) === user.id : false;

    // Uncomment to enable access control
    // const isCurrentUserTenant = String(booking.user) === user.id;
    // if (!isCurrentUserTenant && !isCurrentUserHost) {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    // }

    const updateData: any = {};
    const statusHistory = [...(booking.statusHistory || [])];

    // Handle status updates
    if (status && status !== booking.status) {
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['cancelled', 'checked_in'],
        checked_in: ['checked_out', 'cancelled'],
        cancelled: [], // Cannot change from cancelled
        completed: [], // Cannot change from completed
        checked_out: ['completed']
      };

      if (!validTransitions[booking.status]?.includes(status)) {
        return NextResponse.json({ 
          error: `Cannot change status from ${booking.status} to ${status}` 
        }, { status: 400 });
      }

      // Check permissions for status changes
      if (status === 'confirmed' && !isCurrentUserHost) {
        return NextResponse.json({ error: 'Only hosts can confirm bookings' }, { status: 403 });
      }

      if (status === 'checked_in' && !isCurrentUserHost) {
        return NextResponse.json({ error: 'Only hosts can check in guests' }, { status: 403 });
      }

      if (status === 'checked_out' && !isCurrentUserHost) {
        return NextResponse.json({ error: 'Only hosts can check out guests' }, { status: 403 });
      }

      updateData.status = status;
      statusHistory.push({
        status,
        at: new Date(),
        byRole: isCurrentUserHost ? 'host' : 'tenant',
        byUserId: user.id,
        note: note || `Status changed to ${status}`
      });
    }

    // Handle payment status updates (only hosts can update)
    if (paymentStatus && paymentStatus !== booking.paymentStatus) {
      if (!isCurrentUserHost) {
        return NextResponse.json({ error: 'Only hosts can update payment status' }, { status: 403 });
      }
      updateData.paymentStatus = paymentStatus;
      statusHistory.push({
        status: booking.status,
        at: new Date(),
        byRole: 'host',
        byUserId: user.id,
        note: `Payment status changed to ${paymentStatus}`
      });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    updateData.statusHistory = statusHistory;

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate({
      path: 'property',
      select: 'title media address price host maxGuests bedrooms bathrooms amenities isActive',
      populate: { path: 'host', select: 'name email phone profilePicture' }
    })
    .populate({ path: 'user', select: 'name email phone profilePicture' });

    return NextResponse.json({ 
      booking: updatedBooking,
      message: 'Booking updated successfully'
    });
    
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ 
      error: 'Failed to update booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] - Delete booking (only for cancelled bookings)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string };
  
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking with property (without .lean())
    const bookingDoc = await Booking.findById(id).populate('property');
    if (!bookingDoc) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Convert to plain object
    const booking = bookingDoc.toObject() as PopulatedBooking;
    
    const isCurrentUserTenant = String(booking.user) === user.id;
    const isCurrentUserHost = booking.property?.host ? String(booking.property.host) === user.id : false;

    if (!isCurrentUserTenant && !isCurrentUserHost) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only allow deletion of cancelled bookings
    if (booking.status !== 'cancelled') {
      return NextResponse.json({ 
        error: 'Only cancelled bookings can be deleted' 
      }, { status: 400 });
    }

    await Booking.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Booking deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}