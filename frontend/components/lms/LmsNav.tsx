'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { logout, hasAdminAccess, hasInstructorAccess, isInstructorOnly, lmsFetch, isLoggedIn } from '@/lib/lms/api';

export default function LmsNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string | null; role: string | null }>({ name: null, role: null });
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUser({ name: localStorage.getItem('name'), role: localStorage.getItem('role') });
    if (isLoggedIn()) {
      lmsFetch<{ count: number }>('/api/notifications/unread-count')
        .then((r) => setUnread(r.count || 0))
        .catch(() => {});
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href={user.name ? '/dashboard' : '/'} className="flex items-center gap-3">
          <img src="/logo-horizontal.png" className="h-11 w-auto" alt="Doctor Java" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 lg:flex">
          <Link href="/courses" className="hover:text-purple">
            Courses
          </Link>
          <Link href="/practice" className="hover:text-purple">
            Practice
          </Link>
          <Link href="/coding-tests" className="hover:text-purple">
            Coding
          </Link>
          {user.name && (
            <>
              <Link href="/dashboard" className="hover:text-purple">
                Dashboard
              </Link>
              <Link href="/learnings" className="hover:text-purple">
                My Learning
              </Link>
              <Link href="/leaderboard" className="hover:text-purple">
                Leaderboard
              </Link>
              <Link href="/community" className="hover:text-purple">
                Community
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user.name ? (
            <>
              <Link href="/dashboard" className="relative rounded-full border border-slate-200 p-2 text-ink" title="Notifications">
                <Bell size={17} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold sm:block">
                {user.name}
              </Link>
              {hasInstructorAccess(user.role) && !hasAdminAccess(user.role) && (
                <Link title="Instructor" href="/instructor" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold">
                  Instructor
                </Link>
              )}
              {hasAdminAccess(user.role) && (
                <Link title="Admin" href="/admin" className="rounded-full border border-slate-200 p-2 text-ink">
                  <LayoutDashboard size={17} />
                </Link>
              )}
              <button onClick={logout} title="Sign out" className="rounded-full border border-slate-200 p-2 text-ink">
                <LogOut size={17} />
              </button>
            </>
          ) : pathname === '/login' || pathname === '/register' ? null : (
            <Link href="/login" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
