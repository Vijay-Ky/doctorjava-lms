"use client";

import { motion } from "framer-motion";
import { Github, ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const PROJECTS = [
  { name: "FlowBank", desc: "A microservices-based digital banking platform with fraud detection.", stack: ["Spring Boot", "Kafka", "React"] },
  { name: "MediQueue", desc: "Real-time hospital appointment and queue management system.", stack: ["Java", "WebSocket", "MySQL"] },
  { name: "ShelfSpace", desc: "Inventory & warehouse management platform with AI demand forecasting.", stack: ["Spring", "React", "AI"] },
  { name: "CommuteX", desc: "Ride-pooling app with live tracking and dynamic route optimization.", stack: ["Microservices", "AWS", "React"] },
];

export default function Projects() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Portfolio"
          title={
            <>
              Projects that look right on a <span className="text-gradient">resume</span>
            </>
          }
          description="Every student ships a portfolio of production-grade applications, reviewed and code-reviewed by mentors."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              className="group relative overflow-hidden rounded-xl3 border border-ink/5 bg-gradient-to-br from-surface to-white p-8 shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl font-bold text-ink">{p.name}</h3>
                <div className="flex gap-2 text-muted">
                  <Github size={17} />
                  <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{p.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span key={s} className="rounded-full bg-purple/8 px-3 py-1 text-[11.5px] font-semibold text-purple">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
