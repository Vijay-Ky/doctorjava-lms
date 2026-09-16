export default function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Doctor Java Technologies logo"
    >
      <defs>
        <linearGradient id="dj-purple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8F6BFF" />
          <stop offset="100%" stopColor="#6C3BFF" />
        </linearGradient>
        <linearGradient id="dj-charcoal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      <path d="M50 8 L82 8 L82 58 Q82 92 48 92 L18 92 L18 42 Q18 8 50 8 Z" fill="url(#dj-charcoal)" />
      <path d="M20 6 L52 6 L52 56 Q52 90 18 90 L18 40 Q18 6 20 6 Z" fill="url(#dj-purple)" />
      <circle cx="35" cy="50" r="5.5" fill="#fff" />
      <path d="M35 60 Q35 72 27 78" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}
