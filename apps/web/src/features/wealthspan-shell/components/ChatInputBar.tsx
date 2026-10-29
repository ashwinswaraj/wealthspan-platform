interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onAttach: () => void;
  onMic: () => void;
  onVoice: () => void;
}

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  onAttach,
  onMic,
  onVoice,
}: ChatInputBarProps) {
  return (
    <footer className="w-full pb-3 sm:pb-4 pt-1.5 px-4 z-30 shrink-0 select-none sticky bottom-0 relative">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[96px] sm:h-[104px] pointer-events-none z-10 bg-gradient-to-t from-white/90 dark:from-[#212121]/90 from-0% via-white/70 dark:via-[#212121]/70 via-45% via-white/35 dark:via-[#212121]/35 via-72% via-white/10 dark:via-[#212121]/10 via-90% to-transparent backdrop-blur-[3px]"
        style={{
          maskImage:
            "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 45%, rgba(0, 0, 0, 0.35) 75%, rgba(0, 0, 0, 0) 100%)",
        }}
      />
      <div className="w-full max-w-md mx-auto flex flex-col gap-1.5 justify-between relative z-20">
        <form
          className="flex items-center gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="flex-1 h-[52px] bg-white dark:bg-[#16191f] rounded-full shadow-[0_2px_14px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.3)] flex items-center pl-3.5 pr-2.5 border transition-all border-gray-100 dark:border-[#262a33]">
            <button
              type="button"
              aria-label="Add attachments"
              title="Add attachments"
              onClick={onAttach}
              className="w-8 h-8 flex items-center justify-center text-gray-900 dark:text-gray-100 active:opacity-60 cursor-pointer shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="flex-1 min-w-0 px-2 flex items-center">
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Talk about your wealth"
                className="w-full bg-transparent text-[16px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-normal outline-none tracking-normal"
                type="text"
              />
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Record voice and transcribe"
                title="Record voice and transcribe"
                onClick={onMic}
                className="w-8 h-8 flex items-center justify-center text-gray-900 dark:text-gray-100 active:opacity-60 transition-colors cursor-pointer"
              >
                <svg
                  className="w-[21px] h-[21px]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.9"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Start voice conversation"
                title="Start voice conversation"
                onClick={onVoice}
                className="w-[38px] h-[38px] rounded-full bg-black hover:bg-neutral-800 dark:bg-white dark:text-black text-white flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <div className="flex items-center justify-center gap-[2.5px] h-4">
                  <span className="w-[2.5px] h-2 bg-current rounded-full" />
                  <span className="w-[2.5px] h-4 bg-current rounded-full" />
                  <span className="w-[2.5px] h-4 bg-current rounded-full" />
                  <span className="w-[2.5px] h-2 bg-current rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </footer>
  );
}
