"use client";

import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import SectionHeading from "./SectionHeading";

const MENTORS = [
  { name: "Vikram Reddy", role: "Founder & Lead Mentor", exp: "9+ yrs · Ex-Infosys, Java Architect" },
  { name: "Sneha Kulkarni", role: "Full Stack Mentor", exp: "7 yrs · Ex-Cognizant, React & Spring" },
  { name: "Arjun Nair", role: "DevOps Mentor", exp: "6 yrs · Ex-Wipro, Cloud & Kubernetes" },
  { name: "Divya Iyer", role: "Placement Lead", exp: "5 yrs · Technical Recruiting & HR" },
];

export default function Mentors() {
  return (
    <section id="mentors" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Meet Your Mentors"
          title={
            <>
              Taught by people who&rsquo;ve <span className="text-gradient">shipped the code</span>
            </>
          }
          description="Every mentor is a working or recently practicing engineer &mdash; not a full-time trainer reading slides."
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MENTORS.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="group rounded-xl3 border border-ink/5 bg-surface p-6 text-center shadow-soft transition-all hover:-translate-y-1.5 hover:shadow-card"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-charcoal to-ink font-display text-xl font-bold text-white">
                {m.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="font-display mt-4 text-[15px] font-bold text-ink">{m.name}</h3>
              <p className="mt-1 text-[12.5px] font-semibold text-purple">{m.role}</p>
              <p className="mt-1.5 text-[12px] text-muted">{m.exp}</p>
              <div className="mt-3 flex justify-center">
                <Linkedin size={16} className="text-muted transition-colors group-hover:text-purple" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
