"use client"

import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from '@/components/auth/AuthModalContext';
import AuthModal from "@/components/auth/AuthModal";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        {children}
        <AuthModal />
      </AuthModalProvider>
    </SessionProvider>
  );
}