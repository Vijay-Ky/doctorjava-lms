"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "./SectionHeading";

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { week: "Week 1–4", title: "Core Java & OOP", desc: "Syntax to system thinking — collections, exceptions, multithreading." },
  { week: "Week 5–9", title: "Spring Boot & Databases", desc: "REST APIs, JPA, security, and microservices architecture." },
  { week: "Week 10–14", title: "React & Full Stack Integration", desc: "Modern front-end, state management, and end-to-end apps." },
  { week: "Week 15–18", title: "DevOps, Docker & Cloud", desc: "Docker, Kubernetes, CI/CD and AWS deployment fundamentals." },
  { week: "Week 19–22", title: "AI Tools & System Design", desc: "Prompt-driven engineering, scalability, and interview-ready design rounds." },
  { week: "Week 23–26", title: "Placement Sprint", desc: "Mock interviews, resume building, and direct hiring drives." },
];

export default function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !fillRef.current) return;

    const ctx = gsap.context(() => {
      // Fill the roadmap spine in sync with scroll progress through the section —
      // a literal "statement executing" line as the reader moves stage to stage.
      gsap.fromTo(
        fillRef.current,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            end: "bottom 60%",
            scrub: 0.6,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Career Roadmap"
          title={
            <>
              From your first <span className="semi text-gold">;</span> to your first offer
            </>
          }
          description="A 26-week, statement-by-statement path — each stage closes cleanly before the next begins."
        />

        <div ref={sectionRef} className="relative mt-16">
          <div className="absolute left-[15px] top-0 h-full w-px bg-ink/5 md:left-1/2" />
          <div
            ref={fillRef}
            className="absolute left-[15px] top-0 w-px bg-gradient-to-b from-gold via-purple to-purple/40 md:left-1/2"
          />
          <div className="space-y-10">
            {STAGES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className={`relative flex flex-col gap-4 pl-10 md:w-1/2 md:pl-0 md:pr-10 ${
                  i % 2 === 0 ? "md:ml-0 md:text-right" : "md:ml-auto md:pl-10 md:pr-0 md:text-left"
                }`}
              >
                <span
                  className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-base font-bold text-gold md:left-auto ${
                    i % 2 === 0 ? "md:-right-4" : "md:-left-4"
                  }`}
                >
                  ;
                </span>
                <div className="rounded-xl3 border border-ink/5 bg-surface p-6 shadow-soft">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-purple">
                    {s.week}
                  </span>
                  <h3 className="font-display mt-1.5 text-lg font-bold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

