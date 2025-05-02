
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
// import DashboardCard from '@/components/DashboardCard.tsx';
import DashboardCard from '@/components/DashboardCard';
import RecentBookings from '@/components/RecentBookings';
import WelcomeBanner from '@/components/WelcomeBanner';
// import RecentBookings from '@/components/RecentBookings';
// import PropertyStats from '@/components/PropertyStats';
// import WelcomeBanner from '@/components/WelcomeBanner';
import PropertyStats from '@/components/PropertyStats';
import { MessageIcon } from '@/components/MessageIcon';
import { DollarIcon } from '@/components/DollarIcon';
// import { CalendarIcon } from '@/components/CalendarIcon';
import { CalendarIcon } from '@/components/CalendarIcon';
import { ModeToggle } from '@/components/DarkButton';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const isHost = session.user.role === 'host';

  return (
    <div className="min-h-screen --background">
      {/* Main Content */}
          <ModeToggle/>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        
        <WelcomeBanner user={session.user} />
        
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Total Properties"
            value="12"
            icon={<HomeIcon />}
            trend="up"
            change="3% from last month"
          />
          <DashboardCard 
            title={isHost ? "Bookings" : "Your Trips"}
            value={isHost ? "24" : "3"}
            icon={<CalendarIcon />}
            trend={isHost ? "up" : "steady"}
            change={isHost ? "10% from last month" : "No change"}
          />
          <DashboardCard 
            title={isHost ? "Revenue" : "Wallet"}
            value={isHost ? "$5,240" : "$120"}
            icon={<DollarIcon />}
            trend="up"
            change={isHost ? "12% from last month" : "Recent top-up"}
          />
          <DashboardCard 
            title="Messages"
            value="5"
            icon={<MessageIcon />}
            trend="steady"
            change="2 new today"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Booking Analytics</h3>
            <div className="h-80">
              {/* Chart would go here */}
              <div className="flex items-center justify-center h-full bg-gray-100 rounded">
                <span className="text-gray-500">Booking Chart</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                {isHost ? 'Add New Property' : 'Search Properties'}
              </button>
              <button className="w-full btn-secondary">
                {isHost ? 'Manage Listings' : 'View Wishlist'}
              </button>
              <button className="w-full btn-outline">
                View Messages
              </button>
              <button className="w-full btn-outline">
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6">
          <RecentBookings isHost={isHost} />
          {isHost && <PropertyStats />}
        </div>
      </div>
    </div>
  );
}

// Example icon components
function HomeIcon() {
  return <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">...</svg>;
}
// Add similar for other icons...