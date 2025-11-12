'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SCROLL_KEY = 'property_search_scroll';

export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Save scroll position whenever user navigates away from home page
    const saveScrollPosition = () => {
      if (pathname === '/' || pathname === '') {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      }
    };

    // Save on scroll (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 100);
    };

    if (pathname === '/' || pathname === '') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      saveScrollPosition(); // Save when component unmounts or pathname changes
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [pathname]);

  return null;
}
