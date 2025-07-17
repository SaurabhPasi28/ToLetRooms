'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
// import User from '@/models/User';
import { useAuthModal } from '@/components/auth/AuthModalContext'


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
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <div className="bg-gray-500 text-white rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </Menu.Button>
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-3">
                <p className="text-sm font-medium">Welcome back</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/trips" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Trips
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/wishlists" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Wishlists
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/host" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Airbnb your home
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/account" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Account
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/api/auth/signout" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Log out
                    </Link>
                  )}
                </Menu.Item>
              </div>
            </>
          ) : (
            <>
                  <button 
        onClick={() => openModal('login')}
        className="px-4 py-2 rounded-full hover:bg-gray-100"
      >
        Log in
      </button>
      <button 
        onClick={() => openModal('register')}
        className="px-4 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600"
      >
        Sign up
      </button>

              {/* <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/auth/register" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Sign up
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/auth/login" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Log in
                    </Link>
                  )}
                </Menu.Item>
              </div> */}
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/host" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                      Airbnb your home
                    </Link>
                  )}
                </Menu.Item>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/help" className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
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