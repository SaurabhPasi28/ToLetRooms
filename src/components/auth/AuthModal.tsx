// components/AuthModal.tsx
'use client';

import { useEffect,useRef } from 'react';
import AuthForm from './AuthForm';
import { useAuthModal } from './AuthModalContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal() {
  const { isOpen, type, closeModal } = useAuthModal();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 2 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 overflow-y-auto"
  >
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blur background */}
      <div className="fixed inset-0  bg-opacity-50 " />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div ref={modalRef} className="relative w-full max-w-lg">
          <AuthForm isLogin={type === 'login'} onClose={closeModal} />
        </div>
      </div>
    </div>
    </motion.div>
    </AnimatePresence>
  );
}