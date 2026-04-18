interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ size = 32, className = '', showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Task's Finance logo"
      >
        <defs>
          <linearGradient id="logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="oklch(0.68 0.25 292.717)" />
            <stop offset="100%" stopColor="oklch(0.50 0.25 292.717)" />
          </linearGradient>
          <linearGradient id="logo-line" x1="6" y1="28" x2="34" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />

        {/* Trending chart line */}
        <polyline
          points="7,29 15,19 22,23 33,10"
          stroke="url(#logo-line)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arrow head at top-right */}
        <polyline
          points="27,9 33,10 32,16"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Task lines at bottom-left */}
        <line x1="7" y1="34" x2="16" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.55" />
        <line x1="7" y1="34" x2="10" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0" />

        {/* Checkmark dot */}
        <circle cx="33" cy="10" r="2.5" fill="white" />
      </svg>

      {showWordmark && (
        <span className="text-base font-bold tracking-tight leading-none">
          Task's{' '}
          <span className="text-primary">Finance</span>
        </span>
      )}
    </div>
  );
}
