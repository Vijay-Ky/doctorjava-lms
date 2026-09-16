import { ShieldCheck, Award, BadgeCheck, Star } from "lucide-react";

const COMPANIES = [
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
  "Cognizant",
  "Capgemini",
  "IBM",
  "Deloitte",
  "HCL Tech",
  "Mindtree",
  "L&T Infotech",
  "Tech Mahindra",
];

const BADGES = [
  { icon: ShieldCheck, label: "ISO 9001:2015 Certified" },
  { icon: Award, label: "MSME Registered" },
  { icon: BadgeCheck, label: "Oracle Java Aligned Curriculum" },
  { icon: Star, label: "4.9/5 Rated by 155+ Reviews" },
];

export default function TrustStrip() {
  const loop = [...COMPANIES, ...COMPANIES];
  return (
    <section className="border-y border-ink/5 bg-surface py-14">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Our alumni now build software at
        </p>

        <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-14">
            {loop.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="font-display shrink-0 text-xl font-bold tracking-tight text-ink/25"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BADGES.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-white px-4 py-4 shadow-soft"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple/10 text-purple">
                <b.icon size={18} />
              </div>
              <span className="text-[12.5px] font-semibold leading-tight text-charcoal">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
