import type { Broadcast } from "../hooks/useBroadcasts";

const TONE: Record<Broadcast["severity"], string> = {
  INFO: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  WARNING: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  CRITICAL: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
};

/** Announcements from the Wealthspan team, newest first. */
export function NotificationsSheet({
  broadcasts,
  onClose,
}: {
  broadcasts: Broadcast[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm max-h-[80dvh] overflow-y-auto rounded-3xl bg-white dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Notifications</h2>
          <button type="button" onClick={onClose} className="text-sm text-neutral-500 px-2 py-1">
            Close
          </button>
        </div>
        {broadcasts.length === 0 ? (
          <p className="text-sm text-neutral-500 py-6 text-center">Nothing new right now.</p>
        ) : (
          <ul className="space-y-3">
            {broadcasts.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-[#ebebeb] dark:border-[#2f2f2f] p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONE[b.severity]}`}
                  >
                    {b.severity}
                  </span>
                  <span className="text-sm font-semibold">{b.title}</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 whitespace-pre-wrap">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
