"use client"

import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from '@/components/auth/AuthModalContext';
import AuthModal from "@/components/auth/AuthModal";
import { ScrollRestoration } from '@/components/ScrollRestoration';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        <ScrollRestoration />
        {children}
        <AuthModal />
      </AuthModalProvider>
    </SessionProvider>
  );
}