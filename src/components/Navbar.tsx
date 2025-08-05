import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserMenu from '@/components/UserMenu';

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-rose-500 font-bold text-xl">StayEase</span>
          </Link>

          {/* Search Bar - Middle Section */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
            <div className="flex divide-x divide-gray-300 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <button className="px-4 py-2 text-sm font-medium">Anywhere</button>
              <button className="px-4 py-2 text-sm font-medium">Any week</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 flex items-center">
                Add guests
                <span className="ml-2 bg-rose-500 text-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Host Link */}
            <Link href="/properties/host" className="hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full">
            List Your Property
            </Link>

            {/* User Menu */}
            <UserMenu isLoggedIn={isLoggedIn} user={session?.user} />
          </div>
        </div>
      </div>
    </nav>
  );
}