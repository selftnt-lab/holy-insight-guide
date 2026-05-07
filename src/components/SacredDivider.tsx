const SacredDivider = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center gap-3 text-accent/70 ${className}`}
    aria-hidden
  >
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-accent/40" />
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5" />
    </svg>
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-accent/40" />
  </div>
);

export default SacredDivider;
