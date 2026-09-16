"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const FLOATERS = [
  { label: "Java", top: "14%", left: "6%", delay: 0, color: "bg-charcoal" },
  { label: "Spring", top: "62%", left: "3%", delay: 0.6, color: "bg-purple" },
  { label: "React", top: "20%", left: "88%", delay: 0.3, color: "bg-purple" },
  { label: "Docker", top: "70%", left: "90%", delay: 0.9, color: "bg-charcoal" },
  { label: "K8s", top: "44%", left: "94%", delay: 1.2, color: "bg-gold" },
  { label: "AI", top: "8%", left: "78%", delay: 1.5, color: "bg-gold" },
];

const METRICS = [
  { value: 9, suffix: "+", label: "Years of Experience" },
  { value: 6000, suffix: "+", label: "Students Trained" },
  { value: 94, suffix: "%", label: "Placement Rate" },
  { value: 350, suffix: "+", label: "Hiring Partners" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneLayerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Depth-of-field parallax as the hero scrolls out: the 3D scene and glow
      // drift slower than the page (background), the tech chips drift faster
      // (foreground) — same trick a physical camera rack-focus would give.
      gsap.to(sceneLayerRef.current, {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(glowRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(chipsRef.current, {
        yPercent: -35,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate flex min-h-screen items-center overflow-hidden bg-white pt-28 pb-16"
    >
      {/* backgrounds */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-surface2 via-white to-white" />
      <div className="absolute inset-0 -z-10 dot-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,black,transparent)]" />
      <div
        ref={glowRef}
        className="absolute left-1/2 top-[-10%] -z-10 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-purple/20 blur-[120px]"
      />
      <div ref={sceneLayerRef} className="absolute inset-0 -z-10 opacity-70">
        <HeroScene />
      </div>

      {/* floating tech chips */}
      <div ref={chipsRef} className="pointer-events-none absolute inset-0 z-0">
        {FLOATERS.map((f) => (
          <motion.div
            key={f.label}
            className={`absolute hidden md:flex items-center gap-1.5 rounded-full ${f.color} px-3.5 py-2 text-xs font-semibold text-white shadow-soft`}
            style={{ top: f.top, left: f.left }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          {f.label}
        </motion.div>
      ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/5 px-4 py-1.5 text-[13px] font-semibold text-purple"
          >
            <Sparkles size={14} />
            Bangalore&rsquo;s Premium Java Full Stack + AI Program
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-[clamp(2.4rem,6vw,4.4rem)] font-bold leading-[1.05] tracking-tight text-ink"
          >
            Become an Industry-Ready
            <br />
            <span className="text-gradient">Java Full Stack Developer</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted"
          >
            9+ years of training expertise. 6,000+ students placed. A
            practical, mentor-led curriculum built around Java, Spring Boot,
            React and AI — designed to get you interview-ready, not just
            certificate-ready.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer transition-transform hover:-translate-y-0.5"
            >
              Book Free Demo
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#course"
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-7 py-4 text-[15px] font-semibold text-ink shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <PlayCircle size={18} className="text-purple" />
              Explore Courses
            </a>
          </motion.div>
        </div>

        {/* trust metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="glass mx-auto grid w-full max-w-4xl grid-cols-2 gap-4 rounded-xl4 p-6 shadow-card sm:grid-cols-4 sm:p-8"
        >
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className="font-display mono-num text-3xl font-bold text-ink sm:text-4xl">
                <CountUp end={m.value} duration={2.2} enableScrollSpy scrollSpyOnce />
                {m.suffix}
              </div>
              <div className="mt-1.5 text-[12.5px] font-medium text-muted">
                {m.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
