interface HomeTopBarProps {
  onOpenMenu: () => void;
  onUpgrade: () => void;
  onNotifications: () => void;
  /** Red dot on the bell. */
  hasUnread?: boolean;
}

const circleBtn =
  "w-11 h-11 flex items-center justify-center rounded-full shadow-sm border border-[#ebebeb] dark:border-[#2f2f2f] text-gray-700 dark:text-[#ececec] hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2f2f2f] active:bg-gray-200 dark:active:bg-[#383838] focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer bg-white dark:bg-[#212121]";

export function HomeTopBar({
  onOpenMenu,
  onUpgrade,
  onNotifications,
  hasUnread = true,
}: HomeTopBarProps) {
  return (
    <header className="w-full pt-2 sm:pt-3 px-4 pb-2 flex items-center justify-between z-30 shrink-0 sticky top-0 relative select-none">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[74px] sm:h-[80px] pointer-events-none z-10 bg-gradient-to-b from-[#f9f9f9]/80 dark:from-[#212121]/90 from-0% via-[#f9f9f9]/60 dark:via-[#212121]/60 via-45% via-[#f9f9f9]/30 dark:via-[#212121]/30 via-72% via-[#f9f9f9]/10 dark:via-[#212121]/10 via-90% to-transparent backdrop-blur-[3px]"
        style={{
          maskImage:
            "linear-gradient(rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 45%, rgba(0, 0, 0, 0.35) 75%, rgba(0, 0, 0, 0) 100%)",
        }}
      />
      <button
        aria-label="Open sidebar"
        onClick={onOpenMenu}
        className={`relative z-20 group ${circleBtn}`}
      >
        <svg
          viewBox="0 0 22 18"
          className="w-[20px] h-[18px] text-gray-800 dark:text-[#ececec] group-hover:text-black dark:group-hover:text-white group-active:text-black transition-colors"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="1.25"
            y="1.25"
            width="15.5"
            height="16.5"
            rx="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line x1="6" y1="1.5" x2="6" y2="18.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div className="flex items-center justify-center relative z-20">
        <button
          type="button"
          aria-label="Try Go Free"
          onClick={onUpgrade}
          className="relative z-20 h-10 px-4 flex items-center gap-1.5 rounded-full focus:outline-none active:scale-95 transition-all duration-150 cursor-pointer select-none bg-[#e8f3fe] text-[#0d7bfb] hover:brightness-95 active:bg-gray-200"
        >
          <svg
            className="w-3.5 h-3.5 fill-current transition-colors text-[#0d7bfb]"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.627 12 12 0-6.373 5.627-12 12-12-6.373 0-12-5.373-12-12z" />
          </svg>
          <span className="text-[14.5px] font-semibold tracking-tight transition-colors whitespace-nowrap text-[#0d7bfb]">
            Try Go Free
          </span>
        </button>
      </div>
      <div className="flex items-center gap-2 relative z-20">
        <button aria-label="Notifications" onClick={onNotifications} className={circleBtn}>
          <div className="relative flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-gray-800 dark:text-[#ececec]"
              aria-hidden="true"
            >
              <path
                d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.8297 20.01C14.4097 21.17 13.2997 22 11.9997 22C11.2097 22 10.4297 21.68 9.87969 21.11C9.55969 20.81 9.31969 20.41 9.17969 20C9.30969 20.02 9.43969 20.03 9.57969 20.05C9.80969 20.08 10.0497 20.11 10.2897 20.13C10.8597 20.18 11.4397 20.21 12.0197 20.21C12.5897 20.21 13.1597 20.18 13.7197 20.13C13.9297 20.11 14.1397 20.1 14.3397 20.07C14.4997 20.05 14.6597 20.03 14.8297 20.01Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {hasUnread ? (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white dark:ring-[#212121]" />
            ) : null}
          </div>
        </button>
      </div>
    </header>
  );
}
