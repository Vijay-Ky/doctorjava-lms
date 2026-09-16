"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";

const FAQS = [
  {
    q: "Do I need a coding background to join?",
    a: "No. Over 60% of our students come from non-CS backgrounds. The program starts from Java fundamentals and builds up systematically.",
  },
  {
    q: "Is placement really guaranteed?",
    a: "We don't promise guarantees we can't back — but our placement cell works with 350+ hiring partners and maintains a 94% placement rate for students who complete the program requirements.",
  },
  {
    q: "What's the batch size and schedule?",
    a: "Batches are capped at a 1:12 mentor ratio. We run weekday (full-time) and weekend (part-time) batches to fit working professionals and freshers alike.",
  },
  {
    q: "Will I get hands-on project experience?",
    a: "Yes — you'll build 12+ real applications across the program, including full-stack microservice projects reviewed by mentors and included in your portfolio.",
  },
  {
    q: "What support do I get after placement?",
    a: "Alumni retain lifetime access to job referrals, mock interviews, and mentor office hours for career growth beyond your first offer.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className="overflow-hidden rounded-2xl border border-ink/5 bg-surface"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-display text-[15px] font-semibold text-ink">
                  {f.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple/10 text-purple"
                >
                  <Plus size={15} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="px-6 pb-5 text-[14px] leading-relaxed text-muted">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
