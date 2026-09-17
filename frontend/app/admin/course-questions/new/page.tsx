"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/lms/PageShell";
import { lmsFetch } from "@/lib/lms/api";

const empty = {
  question: "",
  option1: "",
  option2: "",
  option3: "",
  option4: "",
  answer: "",
  courseId: "",
};

function NewCourseQuestionContent() {
  const search = useSearchParams();
  const id = search.get("id");
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [error, setError] = useState("");

  useEffect(() => {
    lmsFetch<any[]>("/api/courses", {}, false).then((cs) => {
      setCourses(cs);
      if (!id && cs[0]) {
        setForm((f: any) => ({ ...f, courseId: cs[0].course_id }));
      }
    });
  }, [id]);

  useEffect(() => {
    if (id) {
      lmsFetch<any>(`/api/questions/${id}`).then((q) =>
        setForm({
          question: q.question,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          answer: q.answer,
          courseId: q.course?.course_id || "",
        }),
      );
    }
  }, [id]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const body = { ...form, courseId: form.courseId };
      if (id) {
        await lmsFetch(`/api/questions/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await lmsFetch("/api/questions", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      location.href = "/admin/course-questions";
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 py-10 md:px-8">
        <Link
          href="/admin/course-questions"
          className="text-sm font-semibold text-slate-500"
        >
          ← Course questions
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold">
          {id ? "Edit" : "Add"} course question
        </h1>

        <form
          onSubmit={save}
          className="mt-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-soft"
        >
          <label>
            <span className="mb-2 block text-sm font-semibold">Course</span>
            <select
              required
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              className="input"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold">Question</span>
            <textarea
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="input min-h-28"
            />
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(
              [
                ["option1", "Option A"],
                ["option2", "Option B"],
                ["option3", "Option C"],
                ["option4", "Option D"],
              ] as const
            ).map(([k, l]) => (
              <label key={k}>
                <span className="mb-2 block text-sm font-semibold">{l}</span>
                <input
                  required
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="input"
                />
              </label>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold">
              Correct answer
            </span>
            <select
              required
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className="input"
            >
              <option value="">Select exact correct option</option>
              {["option1", "option2", "option3", "option4"].map((k) => (
                <option key={k} value={form[k]} disabled={!form[k]}>
                  {form[k] || k}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button className="mt-6 w-full rounded-full bg-ink py-3.5 text-sm font-bold text-white hover:bg-purple">
            {id ? "Update" : "Create"} question
          </button>
        </form>
      </main>
    </PageShell>
  );
}

export default function NewCourseQuestion() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <main className="mx-auto max-w-3xl px-5 py-10 md:px-8">
            <p className="text-slate-500">Loading…</p>
          </main>
        </PageShell>
      }
    >
      <NewCourseQuestionContent />
    </Suspense>
  );
}
