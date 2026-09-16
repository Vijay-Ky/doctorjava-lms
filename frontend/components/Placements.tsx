"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import SectionHeading from "./SectionHeading";

const STORIES = [
  { name: "Ananya Rao", role: "SDE-1 at Infosys", before: "Mechanical Engg. graduate", package: "₹7.2 LPA" },
  { name: "Rahul Menon", role: "Full Stack Dev at Cognizant", before: "2 yrs career gap", package: "₹9.5 LPA" },
  { name: "Priya Sharma", role: "Backend Engineer at TCS", before: "Non-CS background", package: "₹6.8 LPA" },
];

const SALARY_STEPS = [
  { stage: "Before Program", value: 0 },
  { stage: "First Offer", value: 6.5 },
  { stage: "12 Months In", value: 9.2 },
  { stage: "24 Months In", value: 13.8 },
];

export default function Placements() {
  return (
    <section id="placements" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Placement Outcomes"
          title={
            <>
              Real people. Real <span className="text-gradient">offer letters.</span>
            </>
          }
        />

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-xl3 border border-ink/5 bg-white p-7 shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple to-purple-400 font-display text-lg font-bold text-white">
                {s.name.charAt(0)}
              </div>
              <h3 className="font-display mt-4 text-base font-bold text-ink">{s.name}</h3>
              <p className="text-[13px] font-semibold text-purple">{s.role}</p>
              <p className="mt-2 text-[13px] text-muted">Before: {s.before}</p>
              <div className="mt-4 inline-flex rounded-full bg-gold/15 px-3 py-1 text-[12.5px] font-bold text-charcoal">
                {s.package} package
              </div>
            </motion.div>
          ))}
        </div>

        {/* salary growth timeline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-14 rounded-xl4 border border-ink/5 bg-white p-8 shadow-card md:p-10"
        >
          <h3 className="font-display text-lg font-bold text-ink">
            Average salary growth after placement
          </h3>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {SALARY_STEPS.map((step) => (
              <div key={step.stage}>
                <div className="font-display mono-num text-2xl font-bold text-ink sm:text-3xl">
                  {step.value === 0 ? (
                    "₹0"
                  ) : (
                    <>
                      ₹<CountUp end={step.value} decimals={1} duration={2} enableScrollSpy scrollSpyOnce />L
                    </>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple to-gold"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(step.value / 13.8) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="mt-2 text-[12.5px] font-medium text-muted">{step.stage}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
