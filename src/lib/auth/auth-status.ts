'use client';

import { useEffect, useState } from 'react';
import { getUserFromCookie } from '@/lib/auth/kakao-auth';

export function hasAuthSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith('sb-') || row.startsWith('auth-session'));
}

export function isAuthenticatedClientSide(): boolean {
  const user = getUserFromCookie();
  return Boolean(user?.id || user?.email || hasAuthSessionCookie());
}

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sync = () => setIsAuthenticated(isAuthenticatedClientSide());
    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { isAuthenticated };
}
