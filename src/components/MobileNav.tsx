'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Building2, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth/AuthModalContext';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useAuthModal();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="h-9 w-9"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-2">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                
                <Link
                  href="/properties/host"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Building2 className="w-5 h-5" />
                  <span>List Your Property</span>
                </Link>

                <Link
                  href="/properties/listed"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Building2 className="w-5 h-5" />
                  <span>My Properties</span>
                </Link>

                <Link
                  href="/wishlists"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlists</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              </nav>

              {/* Auth Buttons */}
              <div className="p-4 border-t space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    openModal('login');
                    closeMenu();
                  }}
                  className="w-full"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => {
                    openModal('register');
                    closeMenu();
                  }}
                  className="w-full"
                >
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 