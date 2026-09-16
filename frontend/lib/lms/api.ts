const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}


/** Non-sensitive UI session hints only — JWT lives in httpOnly cookie */
export function getUserId() { return typeof window === 'undefined' ? null : localStorage.getItem('id'); }
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  return {
    id: localStorage.getItem('id'),
    name: localStorage.getItem('name'),
    email: localStorage.getItem('email'),
    role: localStorage.getItem('role'),
    // token no longer stored client-side
    token: null as string | null,
  };
}
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('id') && !!localStorage.getItem('role');
}

/**
 * All authenticated calls send credentials so the browser attaches the httpOnly JWT cookie.
 * Do not put the JWT in localStorage.
 */
export async function lmsFetch<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const xsrf = readCookie('XSRF-TOKEN');
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // send DJ_ACCESS_TOKEN cookie
    cache: 'no-store',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function login(email: string, password: string) {
  const result = await lmsFetch<{
    message: string;
    data: { token?: string; id: string; email: string; name: string; role: string };
  }>(`/api/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }, false);
  if (typeof window !== 'undefined' && result.data) {
    const d = result.data;
    localStorage.setItem('id', String(d.id));
    localStorage.setItem('email', d.email);
    localStorage.setItem('name', d.name);
    const role = normalizeRole(d.role);
    localStorage.setItem('role', role ? `ROLE_${role}` : '');
    localStorage.removeItem('token');
  }
  return result.data;
}

export async function logout() {
  try {
    await lmsFetch('/api/auth/logout', { method: 'POST' }, true);
  } catch {
    // ignore network errors on logout
  }
  if (typeof window !== 'undefined') {
    localStorage.clear();
    window.location.href = '/login';
  }
}

/** @deprecated Prefer isLoggedIn() — token is no longer in localStorage */
export function getToken() {
  return null;
}

/** Normalize role strings from backend (ROLE_ADMIN vs ADMIN). */
export function normalizeRole(role: string | null | undefined): string {
  if (!role) return '';
  return role.replace(/^ROLE_/, '').toUpperCase();
}

export function hasAdminAccess(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === 'ADMIN' || r === 'SUPER_ADMIN';
}

export function hasSuperAdminAccess(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'SUPER_ADMIN';
}

export function hasInstructorAccess(role: string | null | undefined): boolean {
  const r = normalizeRole(role);
  return r === 'INSTRUCTOR' || r === 'ADMIN' || r === 'SUPER_ADMIN';
}

/** Instructor-only (not admin) — used for post-login home routing */
export function isInstructorOnly(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'INSTRUCTOR';
}

/** Practice API under /api/v1 — same cookie auth as lmsFetch */
export async function practiceFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const p = path.startsWith('/') ? path : `/${path}`;
  return lmsFetch<T>(`/api/v1${p}`, options, true);
}
