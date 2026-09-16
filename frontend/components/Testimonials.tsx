"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Quote, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "./SectionHeading";

const REVIEWS = [
  {
    name: "Karthik S.",
    role: "Google review · Placed at Accenture",
    quote:
      "The mock interviews were tougher than my actual interview. That's exactly what I needed to walk in confident. Highly recommend Doctor Java for serious learners.",
  },
  {
    name: "Meera Pillai",
    role: "Google review · Career switch",
    quote:
      "I switched careers from teaching to tech in 7 months. The mentors never made me feel behind. Practical projects and continuous guidance made all the difference.",
  },
  {
    name: "Rohit Verma",
    role: "Google review · TCS Digital",
    quote:
      "Placement-focused practice and technical training helped me feel interview-ready. Faculty is experienced and very supportive throughout the course.",
  },
  {
    name: "Sanya Kapoor",
    role: "Google review · IBM",
    quote:
      "Doctor Java doesn't just teach syntax. They teach you how to think like an engineer under a deadline. Best Java training institute in Bangalore for me.",
  },
  {
    name: "Anirudh K.",
    role: "Google review · Full Stack",
    quote:
      "Core Java to Spring Boot and React — the curriculum is well structured. Doubt sessions and weekend support kept me on track until I got placed.",
  },
];

const VIDEOS = [
  { name: "Aditya R.", title: "0 to Offer in 6 Months" },
  { name: "Nikita J.", title: "My Career Switch Story" },
  { name: "Farhan A.", title: "Why I Chose Doctor Java" },
];

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelected(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Student Voices"
          title={
            <>
              Don&rsquo;t take our word for it &mdash; <span className="text-gradient">take theirs</span>
            </>
          }
        />
        <p className="mt-4 text-center text-sm text-muted">
          Real feedback from learners — see more on{" "}
          <a
            href="https://share.google/Gyl0EROJr3xHG3YPS"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-purple hover:underline"
          >
            Google reviews
          </a>
          .
        </p>

        <div className="mt-14 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {REVIEWS.map((r) => (
              <div key={r.name} className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                <div className="flex h-full flex-col rounded-xl3 border border-ink/5 bg-white p-7 shadow-soft">
                  <Quote size={26} className="text-purple/30" />
                  <p className="mt-4 flex-1 text-[14.5px] leading-relaxed text-charcoal">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple/10 font-display text-sm font-bold text-purple">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-bold text-ink">{r.name}</div>
                      <div className="text-[12px] text-muted">{r.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={scrollPrev}
            aria-label="Previous testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition-colors hover:bg-purple hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {REVIEWS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  selected === i ? "w-6 bg-purple" : "w-1.5 bg-ink/15"
                }`}
              />
            ))}
          </div>
          <button
            onClick={scrollNext}
            aria-label="Next testimonial"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition-colors hover:bg-purple hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* video reviews */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {VIDEOS.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative aspect-video overflow-hidden rounded-xl3 bg-gradient-to-br from-charcoal to-ink shadow-soft"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <PlayCircle size={40} className="transition-transform group-hover:scale-110" />
                <div className="text-center">
                  <div className="text-sm font-bold">{v.title}</div>
                  <div className="text-[12px] text-white/60">{v.name}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
