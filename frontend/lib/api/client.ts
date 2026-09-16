/**
 * @deprecated Prefer practiceFetch / lmsFetch from '@/lib/lms/api'.
 * Kept for backward compatibility with practice components.
 */
import { practiceFetch } from '@/lib/lms/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const p = path.startsWith('/') ? path : `/${path}`;
  // practice paths are relative to /api/v1
  return practiceFetch<T>(p, options);
}

export { BASE_URL };
