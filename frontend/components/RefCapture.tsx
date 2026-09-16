'use client';
import { useEffect } from 'react';
export default function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        const maxAge = 60 * 60 * 24 * 30;
        document.cookie = `dj_ref=${encodeURIComponent(ref)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
    } catch {}
  }, []);
  return null;
}
