import { useEffect, useRef } from "react";

const item =
  "w-full px-4 py-3 rounded-[20px] flex items-center gap-3.5 text-left text-gray-950 dark:text-white hover:bg-gray-100/80 dark:hover:bg-[#252a35] active:bg-gray-200/80 dark:active:bg-[#2e3442] active:scale-[0.98] transition-all cursor-pointer";
const icon = "w-6 h-6 stroke-[2] shrink-0 text-gray-950 dark:text-white";
const label =
  "text-[16px] sm:text-[16.5px] font-medium tracking-tight text-gray-950 dark:text-white";

/** The Camera / Photo / File pop-up above the "+" button. Picked files are handed to `onPick`. */
export function AttachMenu({
  onPick,
  onClose,
}: {
  onPick: (files: File[]) => void;
  onClose: () => void;
}) {
  const camera = useRef<HTMLInputElement>(null);
  const photo = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const away = (e: PointerEvent) => {
      if (
        !(e.target as Element).closest("#attachmentFloatingMenu,[aria-label='Add attachments']")
      ) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [onClose]);

  const input = (
    ref: React.RefObject<HTMLInputElement | null>,
    accept: string,
    capture?: boolean,
  ) => (
    <input
      ref={ref}
      type="file"
      accept={accept}
      {...(capture ? { capture: "environment" as const } : {})}
      hidden
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (files.length) onPick(files);
        onClose();
      }}
    />
  );

  return (
    <div
      id="attachmentFloatingMenu"
      className="pointer-events-auto absolute bottom-[72px] sm:bottom-[76px] left-4 w-[220px] sm:w-[230px] bg-white dark:bg-[#1a1d24] rounded-[28px] shadow-[0_16px_44px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100/90 dark:border-[#2b303c] p-2 overflow-hidden z-40"
    >
      <div className="flex flex-col py-0.5">
        <button
          id="attachmentItem-camera"
          type="button"
          className={item}
          onClick={() => camera.current?.click()}
        >
          <svg
            className={icon}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className={label}>Camera</span>
        </button>
        <button
          id="attachmentItem-photo"
          type="button"
          className={item}
          onClick={() => photo.current?.click()}
        >
          <svg
            className={icon}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className={label}>Photo</span>
        </button>
        <button
          id="attachmentItem-file"
          type="button"
          className={item}
          onClick={() => file.current?.click()}
        >
          <svg
            className={icon}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          <span className={label}>File</span>
        </button>
      </div>
      {input(camera, "image/*", true)}
      {input(photo, "image/*")}
      {input(file, "*/*")}
    </div>
  );
}
