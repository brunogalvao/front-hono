export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="logo-bar" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      <rect width="64" height="32" rx="16" fill="white" fillOpacity="0.05" />

      {/* Bar 1 — short */}
      <rect x="9" y="38" width="11" height="17" rx="3" fill="white" fillOpacity="0.45" />

      {/* Bar 2 — medium */}
      <rect x="26" y="27" width="11" height="28" rx="3" fill="white" fillOpacity="0.7" />

      {/* Bar 3 — tall */}
      <rect x="43" y="14" width="11" height="41" rx="3" fill="url(#logo-bar)" />

      {/* Trend line */}
      <polyline
        points="14.5,34 31.5,23 48.5,11"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />

      {/* Arrow head */}
      <polyline
        points="41,9 48.5,11 46.5,18.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}
