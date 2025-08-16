"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
  Calendar,
  MapPin,
  User,
  // BedDouble,
  // Bath,
  Mail,
  Phone,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Heart,
  Share2,
} from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";

type Media = { url: string; type: "image" | "video" };
type Booking = {
  _id: string;
  bookingCode?: string;
  property: {
    _id: string;
    title: string;
    media: Media[] | string[];
    address?: { city?: string; state?: string; street?: string; pinCode?: string };
    price: number;
    host?: { _id: string; name?: string; email?: string; phone?: string; avatar?: string | null };
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
  } | null;
  user?: { name?: string; email?: string };
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  basePrice?: number;
  serviceFee?: number;
  cleaningFee?: number;
  taxes?: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "checked_in" | "checked_out" | "no_show";
  paymentStatus?: "pending" | "partial" | "paid" | "refunded" | "failed";
  specialRequests?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  isCurrentUserTenant?: boolean;
  isCurrentUserHost?: boolean;
  createdAt: string;
};

const StatusPill = ({ status }: { status: Booking["status"] }) => {
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
    <span className={`px-3 py-1 rounded-full text-sm border font-medium ${config.class}`}>
      {config.label}
    </span>
  );
};

export default function BookingDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gallery + wishlist state
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch booking");
        }
        const data = await res.json();
        setBooking(data.booking);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Initialize favorite state from wishlist
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!booking?.property?._id) return;
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;
        const data = await res.json();
        const inWishlist = Array.isArray(data.wishlist)
          ? data.wishlist.some((item: any) => item.propertyId?._id === booking.property?._id)
          : false;
        if (mounted) setIsFavorite(!!inWishlist);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [booking?.property?._id]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: booking?.property?.title || "Property Booking",
        text: `Booking for ${booking?.property?.title || "Property"}`,
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // Silent fail
    }
  };

  const handleWishlistToggle = async () => {
    if (!booking?.property?._id || favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`/api/wishlist?propertyId=${booking.property._id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
        setIsFavorite(false);
        toast.success("Removed from wishlist");
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: booking.property._id }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({} as any));
          if (err?.error === "Property already in wishlist") {
            setIsFavorite(true);
            toast.success("Already in wishlist");
          } else if (res.status === 401) {
            toast.error("Please login to add to wishlist");
          } else {
            throw new Error(err?.error || "Failed to add to wishlist");
          }
        } else {
          setIsFavorite(true);
          toast.success("Added to wishlist");
        }
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update wishlist");
    } finally {
      setFavLoading(false);
    }
  };

  const nights = useMemo(() => {
    if (!booking) return 0;
    return Math.max(1, differenceInCalendarDays(new Date(booking.checkOut), new Date(booking.checkIn)));
  }, [booking]);

  async function handleStatusChange(newStatus: "confirmed" | "cancelled") {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update booking");
      setBooking(data.booking);
      toast.success(`Booking ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium mb-2">Error loading booking</div>
          <div className="text-gray-600 dark:text-gray-400 mb-4">{error}</div>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">Booking not found</div>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Normalize media like PropertyDetails.tsx
  const rawMedia = booking.property?.media || [];
  const mediaItems: Media[] = (rawMedia as any[]).map((m: any) =>
    typeof m === "string" ? { url: m, type: /\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i.test(m) ? "video" : "image" } : m
  );
  const current = mediaItems[currentMediaIndex];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Details</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(booking.checkIn), "PP")} — {format(new Date(booking.checkOut), "PP")} ({nights}{" "}
              {nights === 1 ? "night" : "nights"})
            </span>
          </div>
          {booking.bookingCode && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Booking Code: <span className="font-mono">{booking.bookingCode}</span>
            </div>
          )}
        </div>
        <StatusPill status={booking.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Property + Trip + Host */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property summary with gallery */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
            {/* Main media */}
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800">
              {current?.type === "image" ? (
                <Image src={current.url} alt={booking.property?.title || "Property"} fill className="object-cover" />
              ) : current?.type === "video" ? (
                <video src={current.url} className="object-cover w-full h-full" controls autoPlay loop muted />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2"></div>
                    <div>No media available</div>
                  </div>
                </div>
              )}

              {/* Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-800"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-800"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </>
              )}

              {/* Favorite + Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleWishlistToggle}
                  disabled={favLoading}
                  className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 disabled:opacity-60"
                  aria-label="Favorite"
                  title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700 dark:text-gray-300"}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800"
                  aria-label="Copy link"
                  title="Copy link"
                >
                  <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {mediaItems.map((m, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMediaIndex(index)}
                      className={`relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                        index === currentMediaIndex ? "border-blue-500" : "border-transparent"
                      }`}
                      aria-label={`Media ${index + 1}`}
                    >
                      {m.type === "image" ? (
                        <Image src={m.url} alt={`media-${index + 1}`} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Play className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title + address + link */}
            <div className="px-4 pb-4 space-y-2">
              <div className="text-xl font-semibold text-gray-900 dark:text-white">{booking.property?.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {booking.property?.address?.city}, {booking.property?.address?.state}
              </div>
              <a 
                href={`/property/${booking.property?._id}`} 
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block"
              >
                View property →
              </a>
            </div>
          </div>

          {/* Your trip */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Trip</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">Check-in</div>
                <div className="font-medium">{format(new Date(booking.checkIn), "PP")}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">After 2:00 PM</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400 mb-1">Check-out</div>
                <div className="font-medium">{format(new Date(booking.checkOut), "PP")}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Before 11:00 AM</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 dark:text-gray-400 mb-2">Guests</div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium">{booking.guests} {booking.guests === 1 ? "guest" : "guests"}</span>
                </div>
              </div>
            </div>
            
            {booking.specialRequests && (
              <div>
                <div className="text-gray-600 dark:text-gray-400 mb-2">Special Requests</div>
                <div className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 rounded-lg">
                  {booking.specialRequests}
                </div>
              </div>
            )}
          </div>

          {/* Host contact (if populated by API) */}
          {booking.property?.host && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Host Contact</h2>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{booking.property.host.name || "Host"}</div>
                  {booking.property.host.email && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{booking.property.host.email}</div>
                  )}
                  {booking.property.host.phone && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{booking.property.host.phone}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {booking.property.host.email && (
                    <a
                      href={`mailto:${booking.property.host.email}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  )}
                  {booking.property.host.phone && (
                    <a
                      href={`tel:${booking.property.host.phone}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Price + Actions + Policies */}
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Price Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">₹{booking.property?.price || 0}/night × {nights}</span>
                <span className="font-medium">₹{(booking.basePrice || booking.totalPrice).toLocaleString()}</span>
              </div>
              {booking.serviceFee && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                  <span className="font-medium">₹{booking.serviceFee.toLocaleString()}</span>
                </div>
              )}
              {booking.cleaningFee && booking.cleaningFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cleaning fee</span>
                  <span className="font-medium">₹{booking.cleaningFee.toLocaleString()}</span>
                </div>
              )}
              {booking.taxes && booking.taxes > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                  <span className="font-medium">₹{booking.taxes.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex items-center justify-between font-semibold text-lg">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">₹{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
            
            {booking.paymentStatus && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
            <div className="flex flex-col gap-3">
              {booking.isCurrentUserHost && booking.status === "pending" && (
                <>
                  <button
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <Check className="w-4 h-4" /> 
                    {actionLoading ? "Updating..." : "Confirm Booking"}
                  </button>
                  <button
                    onClick={() => handleStatusChange("cancelled")}
                    disabled={actionLoading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> 
                    {actionLoading ? "Updating..." : "Decline Booking"}
                  </button>
                </>
              )}

              {booking.isCurrentUserTenant && booking.status === "pending" && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="w-4 h-4" /> 
                  {actionLoading ? "Cancelling..." : "Cancel Request"}
                </button>
              )}

              {(booking.status === "cancelled" || booking.status === "completed") && (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  No actions available for {booking.status} bookings
                </div>
              )}
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Booking Policy</h2>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Check-in after 2:00 PM • Check-out before 11:00 AM</li>
              <li>• Free cancellation up to 7 days before check-in</li>
              <li>• No parties or events • No smoking</li>
              <li>• Respect the property and neighbors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}