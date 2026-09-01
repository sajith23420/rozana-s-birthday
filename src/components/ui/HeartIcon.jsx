/* The one heart in the project — the masthead, the ticker's
   separators and the Chapter 01 button all draw this same path, so
   there is a single heart shape rather than three near-misses. */
export function HeartIcon({ size = 16, filled = true, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.6}
      aria-hidden="true"
    >
      <path d="M12 20.6l-1.5-1.36C5.3 14.6 2 11.66 2 8.05 2 5.1 4.24 2.9 7.1 2.9c1.62 0 3.17.77 4.9 2.6 1.73-1.83 3.28-2.6 4.9-2.6 2.86 0 5.1 2.2 5.1 5.15 0 3.61-3.3 6.55-8.5 11.19z" />
    </svg>
  );
}
