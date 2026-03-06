'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function RouteChangeTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    const query = window.location.search.replace(/^\?/, '');
    const url = query ? `${pathname}?${query}` : pathname;

    trackPageView(url);
  }, [pathname]);

  return null;
}
