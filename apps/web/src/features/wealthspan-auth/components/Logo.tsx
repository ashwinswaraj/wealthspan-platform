export function WealthspanWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      <span
        className="wealthspan-logo-tile inline-flex shrink-0 items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg"
        aria-hidden="true"
      >
        <svg
          className="h-[90%] w-[90%]"
          viewBox="0 -1.25 100 100"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 68 C 30 25, 70 25, 82 68" strokeWidth="8.75" />
          <path d="M26 62 L 40 76 L 50 48 L 60 76 L 74 62" strokeWidth="9.4" />
          <circle cx="50" cy="22" r="7" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <div className="text-lg xs:text-xl font-bold tracking-tight text-black dark:text-white flex items-baseline select-none">
        <span>Wealth</span>
        <span className="font-normal text-gray-400 dark:text-gray-500">span</span>
      </div>
    </div>
  );
}

/** The big arc mark in the middle of the login screen (arc draws on in a loop, like the original). */
export function ArcMark() {
  return (
    <svg
      className="w-44 h-44 xs:w-52 xs:h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 overflow-visible text-black dark:text-white"
      fill="none"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        d="M 12.51421 29.81132 L 19.16579 36.53132 L 24.03421 23.09132 L 28.76579 36.42868 L 35.55421 29.70868"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 8.64 32.64 C 14.4 12, 33.6 12, 39.36 32.64"
        stroke="currentColor"
        strokeWidth="3.36"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
