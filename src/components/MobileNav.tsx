'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Home, Building2, Heart, LogOut, Calendar, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth/AuthModalContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { openModal } = useAuthModal();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    closeMenu();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="h-9 w-9 relative"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center gap-3">
                  {isLoggedIn && session?.user && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {session.user.name ? getInitials(session.user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                    {isLoggedIn && session?.user && (
                      <p className="text-sm text-muted-foreground">Welcome back</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMenu}
                  className="h-8 w-8 hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-1 bg-background">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                >
                  <Home className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">Home</span>
                </Link>
                
                <Link
                  href="/properties/host"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                >
                  <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">List Your Property</span>
                </Link>

                {isLoggedIn && (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                    >
                      <Calendar className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">My Trips</span>
                    </Link>

                    <Link
                      href="/properties/listed"
                      onClick={closeMenu}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                    >
                      <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">My Properties</span>
                    </Link>

                    <Link
                      href="/wishlists"
                      onClick={closeMenu}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                    >
                      <Heart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">Wishlists</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                    >
                      <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">Profile Settings</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/help"
                  onClick={closeMenu}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent transition-all duration-200 group"
                >
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">Help Center</span>
                </Link>
              </nav>

              {/* Auth Section */}
              <div className="p-2 border-t bg-muted">
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <div className="px-4 py-3 bg-background rounded-lg border">
                      <p className="text-sm font-medium text-foreground">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="w-full gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 