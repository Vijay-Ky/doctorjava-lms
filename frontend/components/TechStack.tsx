"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

const STACK = [
  { name: "Java", tag: "Language" },
  { name: "Spring Boot", tag: "Framework" },
  { name: "Microservices", tag: "Architecture" },
  { name: "React 19", tag: "Front-end" },
  { name: "Docker", tag: "DevOps" },
  { name: "Kubernetes", tag: "Orchestration" },
  { name: "AWS", tag: "Cloud" },
  { name: "Git & GitHub", tag: "Version Control" },
  { name: "AI Tools", tag: "Copilot / LLMs" },
];

export default function TechStack() {
  return (
    <section id="tech-stack" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Tech Stack"
          title={
            <>
              The exact stack used in <span className="text-gradient">production teams</span>
            </>
          }
          description="No outdated syllabus. You train on the same tools shipping real software at scale today."
        />

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STACK.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: (i % 5) * 0.06 }}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl3 border border-ink/5 bg-white px-4 py-8 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-purple/30 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-surface2 font-display text-lg font-bold text-purple">
                {t.name.charAt(0)}
              </div>
              <span className="font-display text-[14px] font-bold text-ink">
                {t.name}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {t.tag}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
