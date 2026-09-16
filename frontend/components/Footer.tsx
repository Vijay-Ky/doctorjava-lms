import { Instagram, Linkedin, Youtube } from "lucide-react";

const COLS = [
  {
    title: "Programs",
    links: [
      "Java Full Stack with AI",
      "Weekend Batches",
      "Corporate Training",
      "Placement Guarantee Track",
    ],
  },
  {
    title: "Company",
    links: ["Why Doctor Java", "Mentors", "Placements", "Careers"],
  },
  {
    title: "Resources",
    links: [
      "Blog",
      "Free Java Notes",
      "Interview Question Bank",
      "Student Reviews",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink pt-20 pb-8 text-white">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <img
              src="/logo-horizontal-not-tr.png"
              alt="Doctor Java Technologies"
              className="h-12 w-auto object-contain drop-shadow-sm rounded-lg"
            />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/50">
              Learn. Build. Deploy. Succeed. Bangalore&rsquo;s premium Java Full
              Stack + AI training institute, trusted by 6,000+ students.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-purple"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-white/40">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13.5px] text-white/70 transition-colors hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[12.5px] text-white/40">
            © {new Date().getFullYear()} Doctor Java Technologies. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-[12.5px] text-white/40">
            <a href="#" className="hover:text-white/70">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/70">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
