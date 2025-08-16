// src/app/dashboard/owner/bookings/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { 
  Calendar, 
  Check, 
  Clock, 
  Filter, 
  // Link as LinkIcon, 
  Search, 
  XCircle,
  Download,
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  Eye,
  // MessageSquare,
  Star,
  // MapPin,
  Home
} from "lucide-react";
import { toast } from "react-hot-toast";

type Media = { url: string; type: "image" | "video" };
type Booking = {
  _id: string;
  bookingCode: string;
  property: {
    _id: string;
    title: string;
    media: Media[];
    address?: { city?: string; state?: string; street?: string };
    price?: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
  } | null;
  user?: { 
    name?: string; 
    email?: string; 
    phone?: string;
    profilePicture?: string;
  };
  guestDetails?: {
    name: string;
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  basePrice: number;
  serviceFee: number;
  cleaningFee: number;
  taxes: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "checked_in" | "checked_out" | "no_show";
  paymentStatus: "pending" | "partial" | "paid" | "refunded" | "failed";
  specialRequests?: string;
  hostNotes?: string;
  guestNotes?: string;
  nights: number;
  isUpcoming: boolean;
  isActive: boolean;
  isPast: boolean;
  canBeCancelled: boolean;
  createdAt: string;
  statusHistory: Array<{
    status: string;
    at: string;
    byRole: string;
    note?: string;
  }>;
  hostRating?: number;
  guestRating?: number;
};

type Analytics = {
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
};

function StatusPill({ status }: { status: Booking["status"] }) {
  const statusConfig: Record<Booking["status"], { class: string; label: string }> = {
    confirmed: { class: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800", label: "Confirmed" },
    pending: { class: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800", label: "Pending" },
    cancelled: { class: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800", label: "Cancelled" },
    completed: { class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800", label: "Completed" },
    checked_in: { class: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800", label: "Checked In" },
    checked_out: { class: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600", label: "Checked Out" },
    no_show: { class: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800", label: "No Show" },
  };

  const config = statusConfig[status] || { 
    class: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300", 
    label: status || "Unknown" 
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs border ${config.class}`}>
      {config.label}
    </span>
  );
}

function PaymentStatusPill({ status }: { status: Booking["paymentStatus"] }) {
  const statusConfig: Record<Booking["paymentStatus"], { class: string; label: string }> = {
    paid: { class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Paid" },
    pending: { class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "Pending" },
    partial: { class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "Partial" },
    refunded: { class: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", label: "Refunded" },
    failed: { class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Failed" },
  };

  const config = statusConfig[status] || { 
    class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300", 
    label: status || "Unknown" 
  };
  
  return <span className={`px-2 py-1 rounded-full text-xs ${config.class}`}>{config.label}</span>;
}

function MetricCard({ title, value, change, trend, icon: Icon, href }: {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  href?: string;
}) {
  const CardContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
}

export default function HostBookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "confirmed" | "active" | "upcoming" | "past">("all");
  const [groupByProperty, setGroupByProperty] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  // const [showAnalytics, setShowAnalytics] = useState(true);
  const showAnalytics=true;

  async function fetchBookings() {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (tab !== 'all') params.set('status', tab);
      if (showAnalytics) params.set('analytics', 'true');
      if (searchQ.trim()) params.set('search', searchQ);
      
      // Use dedicated host API endpoint
      const res = await fetch(`/api/bookings/host?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch host bookings");
      
      const data = await res.json();
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      if (data.analytics) setAnalytics(data.analytics);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchBookings();
  }, [tab, showAnalytics]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQ !== undefined) fetchBookings();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQ]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchBookings, 120000);
    return () => clearInterval(interval);
  }, [tab]);

  const filtered = useMemo(() => {
    return bookings.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [bookings]);

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      active: bookings.filter((b) => b.isActive).length,
      upcoming: bookings.filter((b) => b.isUpcoming).length,
      past: bookings.filter((b) => b.isPast).length,
    };
  }, [bookings]);

  const groupedByProperty = useMemo(() => {
    const map = new Map<string, { property: NonNullable<Booking["property"]>; items: Booking[] }>();
    for (const b of filtered) {
      if (!b.property) continue;
      const key = b.property._id;
      if (!map.has(key)) map.set(key, { property: b.property, items: [] });
      map.get(key)!.items.push(b);
    }
    return Array.from(map.values());
  }, [filtered]);

  async function updateBookingStatus(id: string, status: "confirmed" | "cancelled" | "checked_in" | "checked_out" | "completed", note?: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
      toast.success(`Booking ${status.replace('_', ' ')}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function updatePaymentStatus(id: string, paymentStatus: "paid" | "refunded") {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, paymentStatus } : b)));
      toast.success(`Payment ${paymentStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update payment");
    } finally {
      setActionLoadingId(null);
    }
  }

  function exportBookings() {
    const csvContent = [
      'Booking Code,Property,Guest Name,Guest Email,Guest Phone,Check In,Check Out,Nights,Guests,Total Price,Status,Payment Status,Created At',
      ...filtered.map(b => [
        b.bookingCode || 'N/A',
        b.property?.title || '',
        b.guestDetails?.name || b.user?.name || 'Unknown Guest',
        b.guestDetails?.email || b.user?.email || 'No email',
        b.guestDetails?.phone || b.user?.phone || 'No phone',
        format(new Date(b.checkIn), 'yyyy-MM-dd'),
        format(new Date(b.checkOut), 'yyyy-MM-dd'),
        b.nights || 0,
        b.guests,
        b.totalPrice,
        b.status,
        b.paymentStatus,
        format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `host-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Booking Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage reservations for your properties</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/properties/listed"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            My Properties
          </Link>
          <button
            onClick={exportBookings}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Bookings"
            value={analytics.totalBookings}
            icon={Calendar}
            href="/dashboard/host_bookings_management?status=all"
          />
          <MetricCard
            title="Total Revenue"
            value={`₹${analytics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <MetricCard
            title="Avg. Booking Value"
            value={`₹${analytics.averageBookingValue.toLocaleString()}`}
            icon={BarChart3}
          />
          <MetricCard
            title="Cancellation Rate"
            value={`${analytics.cancellationRate}%`}
            trend={analytics.cancellationRate > 15 ? 'up' : 'down'}
            icon={TrendingDown}
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search by guest, property, booking code..."
              className="pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              groupByProperty 
                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" 
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setGroupByProperty((v) => !v)}
          >
            <Filter className="w-4 h-4" />
            Group by Property
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
        {[
          { key: "all", label: "All", count: counts.all },
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "confirmed", label: "Confirmed", count: counts.confirmed },
          { key: "active", label: "Active", count: counts.active },
          { key: "upcoming", label: "Upcoming", count: counts.upcoming },
          { key: "past", label: "Past", count: counts.past },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === tabItem.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tabItem.label} ({tabItem.count})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse bg-gray-50 dark:bg-gray-800" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="font-medium">Error loading bookings</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchBookings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl p-10 bg-gray-50 dark:bg-gray-800">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <p className="text-sm">
            {searchQ ? "Try adjusting your search terms." : "Your booking requests will appear here."}
          </p>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && filtered.length > 0 && (
        <>
          {!groupByProperty && (
            <div className="space-y-4">
              {filtered.map((booking) => (
                <BookingRow 
                  key={booking._id} 
                  booking={booking} 
                  actionLoadingId={actionLoadingId}
                  onUpdateStatus={updateBookingStatus}
                  onUpdatePayment={updatePaymentStatus}
                />
              ))}
            </div>
          )}

          {groupByProperty && (
            <div className="space-y-6">
              {groupedByProperty.map(({ property, items }) => (
                <div key={property._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-750">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{property.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {property.address?.city}, {property.address?.state} • {items.length} booking{items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/property/${property._id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Property
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {items.map((booking) => (
                      <div key={booking._id} className="p-4">
                        <BookingRow 
                          booking={booking} 
                          actionLoadingId={actionLoadingId}
                          onUpdateStatus={updateBookingStatus}
                          onUpdatePayment={updatePaymentStatus}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="w-3 h-3" />
        Auto-refreshes every 2 minutes
      </div>
    </div>
  );
}

// Add this helper function after your type definitions (around line 105)
// function getGuestInfo(booking: Booking) {
//   if (booking.guestDetails) {
//     return booking.guestDetails;
//   }
//   // Fallback to user info for backwards compatibility
//   return {
//     name: booking.user?.name || 'Unknown Guest',
//     email: booking.user?.email || 'no-email@example.com',
//     phone: booking.user?.phone || 'No phone'
//   };
// }

// Separate component for individual booking rows
function BookingRow({ 
  booking, 
  actionLoadingId, 
  onUpdateStatus, 
  onUpdatePayment, 
  compact = false 
}: {
  booking: Booking;
  actionLoadingId: string | null;
  onUpdateStatus: (id: string, status: any, note?: string) => void;
  onUpdatePayment: (id: string, paymentStatus: any) => void;
  compact?: boolean;
}) {
  const daysUntilCheckIn = differenceInDays(new Date(booking.checkIn), new Date());
  
  return (
    <div className={`${compact ? '' : 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'}`}>
      <div className={`${compact ? '' : 'p-6'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Booking Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {/* Property Image */}
              {!compact && (
                <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                  {booking.property?.media?.[0]?.url ? (
                    <Image
                      src={booking.property.media[0].url}
                      alt={booking.property.title || 'Property'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              )}

              {/* Booking Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                    {booking.bookingCode}
                  </span>
                  <StatusPill status={booking.status} />
                  <PaymentStatusPill status={booking.paymentStatus} />
                  {booking.hostRating && (
                    <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      {booking.hostRating}
                    </div>
                  )}
                </div>
                
                {!compact && booking.property && (
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {booking.property.title}
                  </h3>
                )}
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(booking.checkIn), "MMM dd")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {booking.guests} guest{booking.guests > 1 ? 's' : ''} • {booking.nights} night{booking.nights > 1 ? 's' : ''}
                    </span>
                    {daysUntilCheckIn >= 0 && booking.status === 'confirmed' && (
                      <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                        {daysUntilCheckIn === 0 ? 'Check-in today' : `${daysUntilCheckIn} days to check-in`}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {booking.guestDetails?.name || booking.user?.name || 'Unknown Guest'}
                    </span>
                    <span>{booking.guestDetails?.email || booking.user?.email || 'No email'}</span>
                    <span>{booking.guestDetails?.phone || booking.user?.phone || 'No phone'}</span>
                  </div>
                  
                  {booking.specialRequests && (
                    <div className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded mt-2">
                      <strong>Special Request:</strong> {booking.specialRequests}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions & Price */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{booking.totalPrice.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ₹{Math.round(booking.totalPrice / booking.nights).toLocaleString()}/night
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/bookings/${booking._id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Details
              </Link>

              {/* Contact Guest */}
              <div className="flex gap-1">
                <a
                  href={`mailto:${booking.guestDetails?.email || booking.user?.email || ''}`}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Email guest"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={`tel:${booking.guestDetails?.phone || booking.user?.phone || ''}`}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Call guest"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Status Actions */}
              {booking.status === "pending" && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onUpdateStatus(booking._id, "confirmed")}
                    disabled={actionLoadingId === booking._id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Confirm
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking._id, "cancelled", "Cancelled by host")}
                    disabled={actionLoadingId === booking._id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}

              {booking.status === "confirmed" && daysUntilCheckIn === 0 && (
                <button
                  onClick={() => onUpdateStatus(booking._id, "checked_in")}
                  disabled={actionLoadingId === booking._id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Check In
                </button>
              )}

              {booking.status === "checked_in" && (
                <button
                  onClick={() => onUpdateStatus(booking._id, "checked_out")}
                  disabled={actionLoadingId === booking._id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Check Out
                </button>
              )}

              {/* Payment Actions */}
              {booking.paymentStatus === "pending" && ["confirmed", "checked_in"].includes(booking.status) && (
                <button
                  onClick={() => onUpdatePayment(booking._id, "paid")}
                  disabled={actionLoadingId === booking._id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  Mark Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
