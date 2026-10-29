export function Greeting({ line, name }: { line: string; name: string }) {
  return (
    <div className="w-full mb-3 text-left">
      <div className="select-none inline-block">
        <h1 className="text-[26px] sm:text-[34px] font-normal tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight flex items-baseline flex-wrap gap-x-1.5">
          <span className="font-normal">{line}</span>
          <span className="inline-flex items-baseline">
            <span className="text-[#2563eb] dark:text-[#3b82f6] font-medium transition-colors">
              {name}
            </span>
            <span className="font-normal text-neutral-900 dark:text-neutral-100">?</span>
          </span>
        </h1>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1">
        Spin or slide to explore finance tools
      </p>
    </div>
  );
}
