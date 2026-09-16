"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  FileCheck2,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Timer,
  Target,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const TABS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "Your entire journey, one screen",
    desc: "Track modules, live classes, mentor sessions and upcoming deadlines in a single unified dashboard.",
    points: ["Live class calendar", "Module-wise progress", "Leaderboard rankings", "Mentor session booking"],
  },
  {
    key: "assignments",
    label: "Assignments",
    icon: ClipboardList,
    title: "Weekly assignments, real constraints",
    desc: "Every assignment mirrors a real sprint ticket — requirements, edge cases and a deadline.",
    points: ["Auto-graded test cases", "Peer code review", "Industry-style tickets"],
  },
  {
    key: "mock-tests",
    label: "Mock Tests",
    icon: FileCheck2,
    title: "Interview-grade objective mock tests",
    desc: "Timed, negatively-marked MCQ assessments across Core Java, Spring Boot, React and DSA — with instant scoring and a full answer review.",
    points: ["Live countdown timer & auto-submit", "Question palette with review flags", "Instant results with topic-wise breakdown"],
  },
  {
    key: "progress",
    label: "Progress",
    icon: TrendingUp,
    title: "Skill growth you can see",
    desc: "A live skill graph across Java, Spring, React, DSA and system design, updated after every assessment.",
    points: ["Skill radar chart", "Leaderboard rankings", "Placement readiness score", "Weekly mentor feedback"],
  },
];

export default function Platform() {
  const [active, setActive] = useState(TABS[0].key);
  const tab = TABS.find((t) => t.key === active)!;
  const isMockTests = tab.key === "mock-tests";

  return (
    <section id="platform" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Learning Platform"
          title={
            <>
              One platform. <span className="text-gradient">Every step of your journey.</span>
            </>
          }
          description="A learning experience engineered like a real product — because you're about to build products like it."
        />

        <div className="mt-14 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-all ${
                active === t.key
                  ? "bg-ink text-white shadow-soft"
                  : "bg-white text-charcoal/70 hover:bg-white hover:text-purple"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative mt-10 overflow-hidden rounded-xl4 border border-ink/5 bg-white p-3 shadow-card md:p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 gap-8 rounded-xl3 bg-gradient-to-br from-surface2 to-white p-8 md:grid-cols-2 md:p-12"
            >
              <div className="flex flex-col justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple text-white">
                  <tab.icon size={22} />
                </div>
                <h3 className="font-display mt-6 text-2xl font-bold text-ink">
                  {tab.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {tab.desc}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {tab.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[14px] font-medium text-charcoal">
                      <CheckCircle2 size={16} className="shrink-0 text-purple" />
                      {p}
                    </li>
                  ))}
                </ul>

                {isMockTests && (
                  <Link
                    href="/mock-tests"
                    className="group mt-7 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3.5 text-[14px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer"
                  >
                    Try a Free Mock Test
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-center">
                {isMockTests ? (
                  <div className="glass w-full max-w-md rounded-xl3 p-6 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-purple/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-purple">
                        Core Java Fundamentals
                      </span>
                      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-charcoal">
                        <Timer size={14} className="text-gold" />
                        18:42
                      </span>
                    </div>
                    <p className="mt-5 text-[14px] font-semibold leading-snug text-ink">
                      Q7. Which of these is <em>not</em> a valid access modifier in Java?
                    </p>
                    <div className="mt-4 space-y-2">
                      {["public", "protected", "internal", "private"].map((opt, i) => (
                        <div
                          key={opt}
                          className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium ${
                            i === 2
                              ? "border-purple bg-purple/8 text-purple"
                              : "border-ink/10 bg-white text-charcoal"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                              i === 2 ? "border-purple bg-purple text-white" : "border-ink/20 text-muted"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-ink/5 pt-4">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                        <Target size={14} />
                        18 / 30 answered
                      </div>
                      <div className="flex gap-1">
                        {[1, 1, 1, 0, 2, 1].map((s, i) => (
                          <span
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              s === 1 ? "bg-purple" : s === 2 ? "bg-gold" : "bg-ink/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass w-full max-w-md rounded-xl3 p-6 shadow-card">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {[92, 68, 100, 45, 78].map((w, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/5">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-purple to-purple-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${w}%` }}
                              transition={{ duration: 0.8, delay: i * 0.08 }}
                            />
                          </div>
                          <span className="mono-num text-xs font-semibold text-muted">{w}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
