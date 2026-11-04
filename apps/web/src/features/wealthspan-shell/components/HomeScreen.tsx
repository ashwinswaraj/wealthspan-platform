import { useMemo, useState } from "react";
import { GREETINGS, timeGreeting } from "../lib/prompts";
import { ChatInputBar } from "./ChatInputBar";
import { Greeting } from "./Greeting";
import { HomeTopBar } from "./HomeTopBar";
import { PromptWheel } from "./PromptWheel";
import { WelcomeCarousel } from "./WelcomeCarousel";

interface HomeScreenProps {
  displayName: string;
  onOpenMenu: () => void;
  onUpgrade: () => void;
  onNotifications: () => void;
  onAsk: (text: string) => void;
  onVoice: () => void;
  /** Red dot on the bell: an announcement the user has not opened yet. */
  hasUnread?: boolean;
}

/** Chat-first home: greeting, spinning prompt wheel, and the "Talk about your wealth" bar. */
export function HomeScreen({
  displayName,
  onOpenMenu,
  onUpgrade,
  onNotifications,
  onAsk,
  onVoice,
  hasUnread = false,
}: HomeScreenProps) {
  const [text, setText] = useState("");
  const [promo, setPromo] = useState(true);
  const line = useMemo(() => {
    const pool = [timeGreeting(new Date().getHours()), ...GREETINGS];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const send = (t: string) => {
    const v = t.trim();
    if (!v) return;
    setText("");
    onAsk(v);
  };

  return (
    <div className="bg-[#ffffff] dark:bg-[#212121] text-[#0d0d0d] dark:text-[#ececec] flex flex-col h-[100dvh] w-full select-none antialiased font-sans overflow-hidden transition-colors duration-200 selection:bg-neutral-300 selection:text-black dark:selection:bg-neutral-600 dark:selection:text-white">
      <div className="w-full max-w-[500px] mx-auto h-full flex flex-col justify-between relative shadow-xs overflow-hidden">
        <HomeTopBar
          onOpenMenu={onOpenMenu}
          onUpgrade={onUpgrade}
          onNotifications={onNotifications}
          hasUnread={hasUnread}
        />
        <main className="relative z-0 isolate flex-1 min-h-0 flex flex-col justify-end w-full max-w-full px-4 sm:px-5 pb-2 -mt-[56px] sm:-mt-[60px] -mb-[68px] sm:-mb-[74px] overflow-hidden">
          {promo ? (
            <WelcomeCarousel onClose={() => setPromo(false)} />
          ) : (
            <div className="w-full flex flex-col justify-end items-start pt-6 sm:pt-8 pb-[74px] sm:pb-[80px] transition-all duration-300 relative select-none z-0 isolate">
              <Greeting line={line} name={displayName} />
              <PromptWheel onPick={(t) => setText(t)} />
            </div>
          )}
        </main>
        <ChatInputBar
          value={text}
          onChange={setText}
          onSubmit={() => send(text)}
          onAttach={() => undefined}
          onMic={() => undefined}
          onVoice={onVoice}
        />
      </div>
    </div>
  );
}
