"use client";

import { useEffect, useMemo, useState } from "react";
import BookingCard from "@/components/booking/BookingCard";
import { Calendar, Filter, Search } from "lucide-react";
import { format } from "date-fns";

type Booking = {
  _id: string;
  bookingCode?: string;
  property: {
    _id: string;
    title: string;
    media: Array<{ url: string; type: "image" | "video" }>;
    address?: { city?: string; state?: string };
    price?: number;
    host?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  } | null;
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
  isUpcoming?: boolean;
  isActive?: boolean;
  isPast?: boolean;
  canBeCancelled?: boolean;
  createdAt: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "upcoming" | "past" | "cancelled">("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Use dedicated tenant API endpoint (main bookings API is for tenants)
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error("Failed to fetch your bookings");
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Memoize the current date to prevent unnecessary re-renders
  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    let items = bookings.slice().sort((a, b) => +new Date(b.checkIn) - +new Date(a.checkIn));
    if (tab === "upcoming") {
      items = items.filter(b => new Date(b.checkIn) >= now && b.status !== "cancelled");
    } else if (tab === "past") {
      items = items.filter(b => new Date(b.checkOut) < now);
    } else if (tab === "cancelled") {
      items = items.filter(b => b.status === "cancelled");
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter(b =>
        (b.property?.title || "").toLowerCase().includes(s) ||
        (b.property?.address?.city || "").toLowerCase().includes(s) ||
        (b.property?.address?.state || "").toLowerCase().includes(s)
      );
    }
    return items;
  }, [bookings, tab, q, now]);

  const counts = useMemo(() => {
    const c = {
      all: bookings.length,
      upcoming: bookings.filter(b => new Date(b.checkIn) >= now && b.status !== "cancelled").length,
      past: bookings.filter(b => new Date(b.checkOut) < now).length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
    };
    return c;
  }, [bookings, now]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Your Bookings</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated:</span>
          <span>{format(new Date(), "PPpp")}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded-md border bg-white overflow-hidden">
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 text-sm ${tab === "all" ? "bg-gray-100 font-medium" : ""}`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setTab("upcoming")}
            className={`px-3 py-1.5 text-sm ${tab === "upcoming" ? "bg-gray-100 font-medium" : ""}`}
          >
            Upcoming ({counts.upcoming})
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-3 py-1.5 text-sm ${tab === "past" ? "bg-gray-100 font-medium" : ""}`}
          >
            Past ({counts.past})
          </button>
          <button
            onClick={() => setTab("cancelled")}
            className={`px-3 py-1.5 text-sm ${tab === "cancelled" ? "bg-gray-100 font-medium" : ""}`}
          >
            Cancelled ({counts.cancelled})
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search bookings..."
              className="pl-7 pr-3 py-1.5 text-sm border rounded-md w-64"
            />
          </div>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border animate-pulse bg-gray-50" />
          ))}
        </div>
      )}

      {error && <div className="text-center text-red-500">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-gray-500 border rounded-xl p-10">
          No bookings found{q ? " for your search" : ""}.
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(b => (
          <BookingCard key={b._id} booking={b as any} />
        ))}
      </div>
    </div>
  );
}
