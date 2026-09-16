"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Users2, Award, ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const MODULES = [
  "Core Java & Advanced OOP",
  "Data Structures & Algorithms",
  "Spring Boot & Microservices",
  "React 19 & Modern Front-End",
  "SQL, MongoDB & JPA/Hibernate",
  "Docker, Kubernetes & CI/CD",
  "AWS Cloud Deployment",
  "AI-Assisted Development",
  "System Design & Interview Prep",
];

export default function Course() {
  return (
    <section id="course" className="bg-charcoal py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">
              Flagship Program
            </div>
            <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.75rem)] font-bold leading-[1.1] tracking-tight">
              Java Full Stack <span className="text-purple-400">with AI</span>
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/70">
              A 26-week, mentor-led program that takes you from Java
              fundamentals to a placement-ready, AI-fluent full stack developer
              &mdash; with real projects at every stage.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Clock, label: "26 Weeks", sub: "Full-time / Weekend" },
                { icon: Users2, label: "1:30 Ratio", sub: "Mentor to student" },
                { icon: Award, label: "96%", sub: "Placement rate" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <s.icon size={18} className="text-gold" />
                  <div className="font-display mt-2 text-lg font-bold">
                    {s.label}
                  </div>
                  <div className="text-[11.5px] text-white/50">{s.sub}</div>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[15px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Get Full Curriculum
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl4 border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="rounded-xl3 bg-gradient-to-br from-purple/20 to-transparent p-6 md:p-8">
              <h3 className="font-display text-lg font-bold text-white">
                What you&rsquo;ll master
              </h3>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MODULES.map((m) => (
                  <div
                    key={m}
                    className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/5 px-3.5 py-3"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-gold"
                    />
                    <span className="text-[13.5px] font-medium leading-snug text-white/85">
                      {m}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
