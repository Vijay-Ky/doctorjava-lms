"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Users,
  Trophy,
  Sparkles,
  BrainCircuit,
  Rocket,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

const REASONS = [
  {
    icon: Code2,
    title: "Build a real app you can sell",
    desc: "Not toy projects. You'll ship microservices, REST APIs and full React front-ends the same way product teams do.",
  },
  {
    icon: BrainCircuit,
    title: "AI-augmented curriculum",
    desc: "Learn to code with Copilot-class AI tools from day one, so you're productive the way modern engineering teams work.",
  },
  {
    icon: Users,
    title: "1:30 mentor-to-student ratio",
    desc: "Small batches. Working engineers as mentors. Every doubt gets resolved before it becomes a gap in your resume.",
  },
  {
    icon: Trophy,
    title: "96% placement rate",
    desc: "Dedicated placement cell, 220+ hiring partners, and mock interviews run by real hiring managers.",
  },
  {
    icon: Rocket,
    title: "Career-outcome roadmap",
    desc: "A week-by-week plan from your first line of Java to your first offer letter — nothing left to guesswork.",
  },
  {
    icon: Sparkles,
    title: "Lifetime placement support",
    desc: "Alumni get continued access to job referrals, mock interviews and mentor office hours, long after graduation.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Why Doctor Java"
          title={
            <>
              Training that ends in an{" "}
              <span className="text-gradient">offer letter</span>
            </>
          }
          description="Every module, mentor session and mock test is designed around one outcome: you, hired as a Java Full Stack Developer."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group relative overflow-hidden rounded-xl3 border border-ink/5 bg-surface p-7 shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-card"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple/5 transition-transform duration-500 group-hover:scale-150" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white transition-colors group-hover:bg-purple">
                <r.icon size={21} />
              </div>
              <h3 className="relative mt-5 font-display text-[17px] font-bold text-ink">
                {r.title}
              </h3>
              <p className="relative mt-2.5 text-[14px] leading-relaxed text-muted">
                {r.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
