'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModalContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  LogOut, 
  Settings, 
  Heart, 
  Calendar,
  Building2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  googleId?: string;
};

export default function UserMenu({ isLoggedIn, user }: { isLoggedIn: boolean; user?: SessionUser}) {
  const { openModal } = useAuthModal();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
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
    <Menu as="div" className="relative">
      <div>
        {isLoggedIn ? (
          <Menu.Button className="flex items-center space-x-2 rounded-full border bg-background px-3 py-2 hover:bg-accent transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Menu.Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => openModal('login')}
              className="text-sm"
            >
              Log in
            </Button>
            <Button
              onClick={() => openModal('register')}
              className="text-sm"
            >
              Sign up
            </Button>
          </div>
        )}
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">Welcome back</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link 
                      href="/dashboard" 
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <Calendar className="mr-3 h-4 w-4" />
                      My Trips
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link 
                      href="/wishlists" 
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <Heart className="mr-3 h-4 w-4" />
                      Wishlists
                    </Link>
                  )}
                </Menu.Item>
              </div>
              
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link 
                      href="/properties/listed" 
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <Building2 className="mr-3 h-4 w-4" />
                      My Properties
                    </Link>
                  )}
                </Menu.Item>
              </div>
              
              <div className="py-1 border-t">
                <Menu.Item>
                  {({ active }) => (
                    <Link 
                      href="/profile" 
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </div>
            </>
          ) : (
            <>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link 
                      href="/properties/listed" 
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <Building2 className="mr-3 h-4 w-4" />
                      My Properties
                    </Link>
                  )}
                </Menu.Item>
              </div>
              
              <div className="py-1 border-t">
                <Menu.Item>
                  {({ active }) => (
                    <Link 
                      href="/help" 
                      className={`${
                        active ? 'bg-accent' : ''
                      } flex items-center px-4 py-2 text-sm text-foreground`}
                    >
                      <HelpCircle className="mr-3 h-4 w-4" />
                      Help Center
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}