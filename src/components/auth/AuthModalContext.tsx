// context/AuthModalContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

type AuthModalContextType = {
  isOpen: boolean;
  type: 'login' | 'register';
  openModal: (type: 'login' | 'register') => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'login' | 'register'>('login');

  const openModal = (modalType: 'login' | 'register') => {
    setType(modalType);
    setIsOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.classList.remove('modal-open');
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, type, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  // console.log("Model hit",context);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within a AuthModalProvider');
  }
  return context;
}