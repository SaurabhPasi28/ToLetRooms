import { Types } from "mongoose";
import { DateRange } from 'react-day-picker';

// Booking Status Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in' | 'checked_out' | 'no_show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

// Guest Information
export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  idType?: 'passport' | 'national_id' | 'drivers_license' | 'none';
  idNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Status History
export interface StatusHistoryItem {
  status: BookingStatus;
  at: Date;
  byRole: 'tenant' | 'host' | 'system';
  byUserId?: Types.ObjectId | string;
  note?: string;
  reason?: string;
}

// Core Booking Interface (matches Mongoose model)
export interface IBooking {
  _id?: string;
  property: Types.ObjectId | string;
  user: Types.ObjectId | string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  guestInfo?: GuestInfo;
  specialRequests?: string;
  
  // Pricing
  basePrice: number;
  serviceFee?: number;
  cleaningFee?: number;
  taxes?: number;
  totalPrice: number;
  
  // Status
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  statusHistory?: StatusHistoryItem[];
  
  // Additional fields
  paymentMethod?: string;
  refundAmount?: number;
  hostNotes?: string;
  guestNotes?: string;
  actualCheckIn?: Date;
  actualCheckOut?: Date;
  earlyCheckin?: boolean;
  lateCheckout?: boolean;
  hostRating?: number;
  guestRating?: number;
  hostReview?: string;
  guestReview?: string;
  cancellationReason?: string;
  cancellationPolicy?: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  bookingCode?: string;
  reminderSent?: boolean;
  confirmationSent?: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

// Populated Booking (for API responses)
export interface PopulatedBooking extends Omit<IBooking, 'property' | 'user'> {
  property: {
    _id: string;
    title: string;
    media: Array<{ url: string; type: 'image' | 'video' }> | string[];
    address?: {
      city?: string;
      state?: string;
      street?: string;
      pinCode?: string;
    };
    price: number;
    host?: {
      _id: string;
      name?: string;
      email?: string;
      phone?: string;
      avatar?: string | null;
    };
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
  } | null;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
  };
  // Computed fields
  nights?: number;
  isUpcoming?: boolean;
  isActive?: boolean;
  isPast?: boolean;
  canBeCancelled?: boolean;
  isCurrentUserTenant?: boolean;
  isCurrentUserHost?: boolean;
  guestDetails?: {
    name: string;
    email: string;
    phone: string;
  };
}

// Component Props Types
export interface BookingWidgetProps {
  price: number;
  dateRange: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  guests: number;
  onGuestsChange: (guests: number) => void;
  maxGuests: number;
}

export interface BookingConfirmationProps {
  property: any; // Could be typed more strictly
  checkIn: Date;
  checkOut: Date;
  guests: number;
  user: any; // Could be typed more strictly
}

// Analytics Types (for host dashboard)
export interface HostAnalytics {
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    bookings: number;
  }>;
  statusCounts: Record<string, number>;
  recentBookings: number;
  properties: number;
  averageBookingValue: number;
  cancellationRate: number;
}

// API Response Types
export interface BookingApiResponse {
  booking: PopulatedBooking;
  message?: string;
}

export interface BookingsListApiResponse {
  bookings: PopulatedBooking[];
  total: number;
  analytics?: HostAnalytics;
}

// Form Types
export interface BookingFormData {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  guestInfo: GuestInfo;
  specialRequests?: string;
  totalPrice: number;
  basePrice: number;
  serviceFee?: number;
  cleaningFee?: number;
  taxes?: number;
}
