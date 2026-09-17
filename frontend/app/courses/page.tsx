"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import PageShell from "@/components/lms/PageShell";
import { lmsFetch } from "@/lib/lms/api";

type Course = {
  course_id: string;
  course_name: string;
  price: number;
  instructor: string;
  description: string;
  p_link?: string;
  y_link?: string;
};

type PageResult = {
  content: Course[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const gradients = [
  "from-slate-900 via-slate-800 to-violet-700",
  "from-indigo-900 via-purple-800 to-fuchsia-700",
  "from-emerald-900 via-teal-800 to-cyan-700",
  "from-rose-900 via-pink-800 to-orange-600",
  "from-blue-900 via-sky-800 to-indigo-600",
];

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(
    searchParams.get("sort") || "course_name,asc",
  );
  const [page, setPage] = useState(Number(searchParams.get("page") || "0"));
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("page", String(page));
    params.set("size", "12");
    params.set("sort", sort);
    try {
      const data = await lmsFetch<PageResult | Course[]>(
        `/api/courses?${params}`,
        {},
        false,
      );
      if (Array.isArray(data)) {
        setCourses(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        setCourses(data.content || []);
        setTotal(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [q, page, sort]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (page > 0) params.set("page", String(page));
    if (sort !== "course_name,asc") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `/courses?${qs}` : "/courses", { scroll: false });
  }, [q, page, sort, router]);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 md:px-8 md:py-10">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple px-6 py-10 text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            Courses
          </p>
          <h1 className="mt-2 max-w-xl font-display text-3xl font-bold sm:text-4xl">
            Learn job-ready skills online
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Browse courses like Udemy — curriculum, previews, assessments and
            certificates. Built for Doctor Java learners.
          </p>
          <div className="relative mt-6 max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => {
                setPage(0);
                setQ(e.target.value);
              }}
              placeholder="Search for anything — Java, Spring, React…"
              className="w-full rounded-full border-0 bg-white py-3.5 pl-11 pr-4 text-sm text-ink shadow-lg outline-none ring-0"
            />
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-600">
            {loading ? "Loading…" : `${total} course${total === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => {
                setPage(0);
                setSort(e.target.value);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink"
            >
              <option value="course_name,asc">Name A–Z</option>
              <option value="course_name,desc">Name Z–A</option>
              <option value="price,asc">Price: low to high</option>
              <option value="price,desc">Price: high to low</option>
            </select>
            <Link href="/learnings" className="text-sm font-bold text-purple">
              My Learning →
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c, i) => (
            <Link
              key={c.course_id}
              href={`/course/${c.course_id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`relative flex h-36 items-end bg-gradient-to-br p-4 text-white ${gradients[i % gradients.length]}`}
              >
                <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
                <span className="relative rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                  Bestseller
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug text-ink group-hover:text-purple">
                  {c.course_name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{c.instructor}</p>
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  4.{(7 + (i % 3)).toString()}
                  <span className="font-normal text-slate-400">
                    ({120 + i * 37})
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-slate-500">
                  {c.description}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-base font-bold text-ink">
                    ₹{Number(c.price).toLocaleString("en-IN")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                    <Clock size={11} /> Self-paced
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-sm text-slate-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </PageShell>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 md:px-8 md:py-10">
            <p className="text-slate-500">Loading courses…</p>
          </main>
        </PageShell>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}
