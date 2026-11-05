import { useEffect, useMemo, useRef, useState } from "react";
import { ChatThread, useChat, useSpeechInput } from "@/features/wealthspan-chat";
import { GREETINGS, timeGreeting } from "../lib/prompts";
import { AttachMenu } from "./AttachMenu";
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
  /** Red dot on the bell: an announcement the user has not opened yet. */
  hasUnread?: boolean;
}

/** Chat-first home: greeting, spinning prompt wheel, and the "Talk about your wealth" bar. */
export function HomeScreen({
  displayName,
  onOpenMenu,
  onUpgrade,
  onNotifications,
  hasUnread = false,
}: HomeScreenProps) {
  const [text, setText] = useState("");
  const [promo, setPromo] = useState(true);
  const [attach, setAttach] = useState(false);
  const line = useMemo(() => {
    const pool = [timeGreeting(new Date().getHours()), ...GREETINGS];
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const chat = useChat();
  const speech = useSpeechInput();
  const [files, setFiles] = useState<File[]>([]);
  const [notice, setNotice] = useState("");
  const [recording, setRecording] = useState(false);
  const autoSend = useRef(false);
  const startedAt = useRef(0);

  const send = async (t: string) => {
    const v = t.trim();
    if ((!v && !files.length) || chat.pending) return;
    const parts = await Promise.all(files.map(describe));
    setText("");
    setFiles([]);
    setNotice("");
    chat.send([v, ...parts].filter(Boolean).join("\n\n"));
  };

  const beginVoice = (andSend: boolean) => {
    autoSend.current = andSend;
    setNotice("");
    startedAt.current = Date.now();
    if (speech.start()) setRecording(true);
  };

  // When the recognizer stops (stop button, silence, or an error), put what it heard into the bar, or send it.
  useEffect(() => {
    if (!recording || speech.listening) return;
    if (Date.now() - startedAt.current < 400) return;
    setRecording(false);
    const heard = speech.text.trim();
    if (heard) {
      if (autoSend.current) chat.send([text, heard].filter(Boolean).join(" "));
      else setText((t) => [t, heard].filter(Boolean).join(" "));
      if (autoSend.current) setText("");
    }
    if (speech.error) setNotice(speech.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speech.listening]);

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
          {chat.messages.length > 0 ? (
            <ChatThread
              messages={chat.messages}
              pending={chat.pending}
              onRetry={chat.retry}
              onNewChat={chat.reset}
              onUpgrade={onUpgrade}
            />
          ) : promo ? (
            <WelcomeCarousel onClose={() => setPromo(false)} />
          ) : (
            <div className="w-full flex flex-col justify-end items-start pt-6 sm:pt-8 pb-[74px] sm:pb-[80px] transition-all duration-300 relative select-none z-0 isolate">
              <Greeting line={line} name={displayName} />
              <PromptWheel onPick={(t) => setText(t)} />
            </div>
          )}
        </main>
        {attach ? (
          <AttachMenu
            onPick={(f) => setFiles((cur) => [...cur, ...f].slice(0, 4))}
            onClose={() => setAttach(false)}
          />
        ) : null}
        <ChatInputBar
          value={text}
          onChange={setText}
          onSubmit={() => {
            if (recording) {
              autoSend.current = true;
              speech.stop();
              return;
            }
            void send(text);
          }}
          onAttach={() => setAttach((a) => !a)}
          onMic={() => beginVoice(false)}
          onVoice={() => beginVoice(true)}
          attachments={files}
          onRemoveAttachment={(i) => setFiles((f) => f.filter((_, j) => j !== i))}
          recording={recording}
          heard={speech.text}
          onCancelRecording={() => {
            speech.cancel();
            setRecording(false);
          }}
          onStopRecording={() => {
            autoSend.current = false;
            speech.stop();
          }}
          notice={notice || (recording ? speech.error : "")}
          disabled={chat.pending}
        />
      </div>
    </div>
  );
}

const TEXTY = /\.(txt|csv|json|md|tsv)$/i;
/** What the assistant receives for a picked file: the text of small text files, otherwise just the name. */
async function describe(f: File): Promise<string> {
  if ((f.type.startsWith("text/") || TEXTY.test(f.name)) && f.size < 200_000) {
    const body = (await f.text()).slice(0, 1400);
    return `[File ${f.name}]\n${body}`;
  }
  return `[Attached ${f.type.startsWith("image/") ? "image" : "file"}: ${f.name}. Reading this type of file is not available yet.]`;
}
