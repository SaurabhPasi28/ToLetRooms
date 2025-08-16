"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Calendar, 
  Home, 
  // Users, 
  // BarChart3, 
  Settings, 
  Plus,
  Eye,
  // MessageSquare,
  DollarSign,
  TrendingUp,
  Building
} from "lucide-react";

type DashboardStats = {
  totalBookings: number;
  totalRevenue: number;
  activeProperties: number;
  pendingBookings: number;
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hasProperties, setHasProperties] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Check if user has properties (making them a potential host)
        const propertiesRes = await fetch('/api/properties?limit=1');
        const propertiesData = await propertiesRes.json();
        const userHasProperties = propertiesData.properties && propertiesData.properties.length > 0;
        setHasProperties(userHasProperties);

        // Fetch host analytics if user has properties
        if (userHasProperties) {
          const res = await fetch('/api/bookings/host?analytics=true&limit=1');
          if (res.ok) {
            const data = await res.json();
            if (data.analytics) {
              setStats({
                totalBookings: data.analytics.totalBookings || 0,
                totalRevenue: data.analytics.totalRevenue || 0,
                activeProperties: data.analytics.properties || 0,
                pendingBookings: data.analytics.statusCounts?.pending || 0
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  // Quick actions for everyone
  const allQuickActions = [
    { 
      href: "/search", 
      label: "Find Properties", 
      icon: Eye, 
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Discover places to stay"
    },
    { 
      href: "/bookings", 
      label: "My Bookings", 
      icon: Calendar, 
      color: "bg-green-600 hover:bg-green-700",
      description: "View your reservations"
    },
    { 
      href: "/properties/host", 
      label: "List Property", 
      icon: Plus, 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Become a host"
    },
    { 
      href: "/profile", 
      label: "Profile", 
      icon: Settings, 
      color: "bg-orange-600 hover:bg-orange-700",
      description: "Manage your account"
    },
  ];

  // Additional actions for users who have properties
  const hostQuickActions = [
    { 
      href: "/dashboard/host_bookings_management", 
      label: "Manage Bookings", 
      icon: Calendar, 
      color: "bg-green-600 hover:bg-green-700",
      description: "Manage property bookings"
    },
    { 
      href: "/properties/listed", 
      label: "My Properties", 
      icon: Home, 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Manage your listings"
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-blue-100 text-lg">
          {hasProperties 
            ? "Manage your properties and bookings, or discover new places to stay"
            : "Discover amazing places and book your next adventure"
          }
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allQuickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white p-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg group`}
            >
              <action.icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-lg font-semibold mb-1">{action.label}</div>
              <div className="text-sm opacity-90">{action.description}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Host Actions (if user has properties) */}
      {hasProperties && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Host Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hostQuickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.color} text-white p-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg group`}
              >
                <action.icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-semibold mb-1">{action.label}</div>
                <div className="text-sm opacity-90">{action.description}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Stats (for property owners) */}
      {hasProperties && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Hosting Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? '...' : stats?.totalBookings || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? '...' : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Properties</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? '...' : stats?.activeProperties || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Building className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? '...' : stats?.pendingBookings || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/bookings" 
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">My Bookings</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">View your reservations as a guest</div>
            </div>
          </Link>
          <Link 
            href="/search" 
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Explore Properties</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Find your next perfect stay</div>
            </div>
          </Link>
          {hasProperties && (
            <>
              <Link 
                href="/dashboard/host_bookings_management" 
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Host Booking Management</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Manage bookings for your properties</div>
                </div>
              </Link>
              <Link 
                href="/properties/listed" 
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Property Listings</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Edit and manage your property listings</div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}