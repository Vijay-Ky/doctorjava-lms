'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, LogIn, UserCircle, LayoutDashboard, LogOut } from 'lucide-react';

const LINKS = [
  { label: 'Why Us', href: '#why-us' },
  { label: 'Platform', href: '#platform' },
  { label: 'Course', href: '#course' },
  { label: 'Tech Stack', href: '#tech-stack' },
  { label: 'Practice', href: '/practice' },
  { label: 'Courses', href: '/courses' },
  { label: 'Placements', href: '#placements' },
  { label: 'Mentors', href: '#mentors' },
  { label: 'FAQ', href: '#faq' },
];

type AuthUser = { name: string | null; role: string | null; token: string | null };

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser>({ name: null, role: null, token: null });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setUser({
      name: localStorage.getItem('name'),
      role: localStorage.getItem('role'),
      // session present if we have id (JWT is httpOnly cookie)
      token: localStorage.getItem('id'),
    });
  }, []);

  function logout() {
    localStorage.clear();
    setUser({ name: null, role: null, token: null });
    window.location.href = '/';
  }

  const isAdmin =
    user.role === 'ROLE_ADMIN' ||
    user.role === 'ROLE_SUPER_ADMIN' ||
    user.role === 'ADMIN' ||
    user.role === 'SUPER_ADMIN';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div
        className={`mx-auto max-w-7xl transition-all duration-500 ${
          scrolled ? 'mt-3 px-4' : 'mt-0 px-0'
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? 'glass rounded-2xl px-4 py-3 shadow-soft sm:px-5'
              : 'px-4 py-4 sm:px-6 sm:py-5 md:px-10'
          }`}
        >
          <a href="#top" className="flex min-w-0 items-center shrink-0">
            <img
              src="/logo-horizontal.png"
              alt="Doctor Java Technologies"
              className="h-12 w-auto object-contain sm:h-14 md:h-16"
            />
          </a>

          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {LINKS.map((l) =>
              l.href.startsWith('/') ? (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-medium text-charcoal/80 transition-colors hover:text-purple xl:text-[13.5px]"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-medium text-charcoal/80 transition-colors hover:text-purple xl:text-[13.5px]"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            {user.token ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/lms"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-[13px] font-semibold text-ink hover:border-purple/40 hover:text-purple"
                  >
                    <LayoutDashboard size={15} />
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-full border border-slate-200 px-3 py-2 text-[13px] font-semibold text-ink"
                >
                  <UserCircle size={15} className="shrink-0" />
                  <span className="truncate">{user.name || 'Account'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 p-2 text-ink hover:text-rose-600"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-purple/40 hover:text-purple"
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
                <a
                  href="#contact"
                  className="relative overflow-hidden rounded-full px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer xl:px-5"
                >
                  Book Free Demo
                </a>
              </>
            )}
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 text-ink lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mt-2 rounded-2xl p-5 shadow-soft lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {LINKS.map((l) =>
                l.href.startsWith('/') ? (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-charcoal"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-charcoal"
                  >
                    {l.label}
                  </a>
                )
              )}
              <div className="my-2 h-px bg-slate-200" />
              {user.token ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold text-ink"
                  >
                    {user.name || 'My profile'}
                  </Link>
                  <Link
                    href="/learnings"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-charcoal"
                  >
                    My Learning
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/lms"
                      onClick={() => setOpen(false)}
                      className="text-sm font-semibold text-purple"
                    >
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="mt-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-rose-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-slate-200 py-2.5 text-center text-sm font-semibold text-ink"
                  >
                    Sign In
                  </Link>
                  <a
                    href="#contact"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-purple py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Book Free Demo
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
