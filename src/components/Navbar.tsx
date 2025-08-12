import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserMenu from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import MobileNav from '@/components/MobileNav';
import { ScrollSearchBar } from '@/components/ScrollSearchBar';

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="hidden font-bold sm:inline-block text-xl">
                StayEase
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Host Link */}
              <Link 
                href="/properties/host" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                List Your Property
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <UserMenu isLoggedIn={isLoggedIn} user={session?.user} />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Scroll-triggered Search Bar */}
      <ScrollSearchBar />
    </>
  );
}