"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-ink py-24 text-white md:py-32"
    >
      <div className="absolute left-1/2 top-0 -z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-purple/25 blur-[130px]" />
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-gold">
              Book a Free Demo
            </div>
            <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.75rem)] font-bold leading-[1.1] tracking-tight">
              Your first line of code starts here
            </h2>
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-white/70">
              Talk to an academic advisor, get your personalised roadmap, and
              sit in on a live class &mdash; no cost, no obligation.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Phone size={16} />
                </div>
                <span className="text-[14.5px] font-medium text-white/85">
                  +91 8867739948
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Mail size={16} />
                </div>
                <span className="text-[14.5px] font-medium text-white/85">
                  admissions@doctorjava.tech
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <MapPin size={16} />
                </div>
                <span className="text-[14.5px] font-medium text-white/85">
                  Vijayanagar, Bangalore, Karnataka
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl4 bg-white p-7 text-ink shadow-card sm:p-9"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <CheckCircle2 size={42} className="text-purple" />
                <h3 className="font-display mt-4 text-lg font-bold">
                  You&rsquo;re on the list
                </h3>
                <p className="mt-2 max-w-xs text-[14px] text-muted">
                  An academic advisor will call you within 24 hours to schedule
                  your free demo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-[13px] font-semibold text-charcoal"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    required
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-purple"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-[13px] font-semibold text-charcoal"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      required
                      type="tel"
                      placeholder="+91"
                      className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-purple"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-[13px] font-semibold text-charcoal"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      required
                      type="email"
                      placeholder="you@email.com"
                      className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-purple"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="track"
                    className="mb-1.5 block text-[13px] font-semibold text-charcoal"
                  >
                    I&rsquo;m interested in
                  </label>
                  <select
                    id="track"
                    className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-purple"
                  >
                    <option>Java Full Stack with AI (26 weeks)</option>
                    <option>Weekend Batch</option>
                    <option>Corporate Training</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer"
                >
                  Book My Free Demo
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
                <p className="text-center text-[11.5px] text-muted">
                  By submitting, you agree to be contacted by our admissions
                  team.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
