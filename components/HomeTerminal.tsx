"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
import TerminalShell, { PrintFn } from "@/components/TerminalShell";
import type { PostMetadata } from "@/lib/posts";

type Mood = "direct" | "coffee" | "skeptic";

const MOOD_OVERRIDES: Record<Mood, { prompt?: string; firstMessage?: string }> = {
  direct: {},
  coffee: {
    prompt:
      "You are Jacobo, but you've had 3 coffees. Talk fast, be extremely enthusiastic and a little hyper about everything. Keep it fun and high-energy, still helpful and honest.",
    firstMessage:
      "Hey! Okay so — I'm Jacobo, three coffees deep, ask me literally anything, I have a LOT of opinions right now.",
  },
  skeptic: {
    prompt:
      "You are Jacobo in full skeptical-VC mode. Deadpan, a little dry, you poke holes in whatever the visitor says before agreeing with them. Still friendly underneath it.",
    firstMessage: "Hi, I'm Jacobo. Before we go further — what's your traction?",
  },
};

const BOOT = [
  "Hello World!",
  "",
  "Welcome, my name is Jacobo De Cal. I'm a former Venture Capitalist, now building global B2B payments powered by stablecoins at Lumx. I write about financial infrastructure, stablecoins, AI, business, and startups.",
  "",
  "Available commands: essays · contact · talk · subscribe · play · help",
];

const SKILLS = [
  "TypeScript / Next.js / React",
  "Postgres, Supabase, pipelines that don't fall over",
  "prompt wrangling & agent orchestration",
  "stablecoin rails & B2B payments infra",
  "still can't design a logo to save my life",
];

export default function HomeTerminal({ posts }: { posts: PostMetadata[] }) {
  const router = useRouter();
  const [mood, setMood] = useState<Mood>("direct");
  const [pendingTalk, setPendingTalk] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const printRef = useRef<PrintFn | null>(null);

  const conversation = useConversation({
    overrides: {
      agent: {
        ...(MOOD_OVERRIDES[mood].prompt && {
          prompt: { prompt: MOOD_OVERRIDES[mood].prompt },
        }),
        ...(MOOD_OVERRIDES[mood].firstMessage && {
          firstMessage: MOOD_OVERRIDES[mood].firstMessage,
        }),
      },
    },
    // Tracked locally rather than via conversation.status: our own state
    // updates in lockstep with the command handler that reads it, so the
    // hang-up check below never races the SDK's internal status timing.
    onConnect: () => setCallStatus("connected"),
    onDisconnect: () => setCallStatus("idle"),
    onError: () => setCallStatus("idle"),
    onMessage: () => {},
  });

  // startSession must run after `mood` has actually re-rendered into `conversation`'s
  // overrides, so we defer it to an effect keyed on the mood update rather than firing
  // it right after setMood (which would still see the previous session's overrides).
  useEffect(() => {
    if (!pendingTalk) return;
    setPendingTalk(false);
    setCallStatus("connecting");
    const print = printRef.current;
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: "agent_4101kfc2vz2ae1cre64r0n0mcjk7",
          connectionType: "websocket",
        });
        print?.(["connected. say hi. type 'talk' again to hang up."]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "failed to connect";
        print?.([`error: ${message}`]);
        setCallStatus("idle");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTalk, mood]);

  const handleCommand = async (raw: string, { print, clear }: { print: PrintFn; clear: () => void }) => {
    const cmd = raw.trim();
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);

    switch (name) {
      case "":
        break;
      case "help":
        print([
          "available commands:",
          "  about              the short version",
          "  skills             what I'm actually good at",
          "  essays             everything I've written",
          "  open <n>           open essay number n",
          "  contact            how to reach me",
          "  talk [coffee|skeptic]   voice-chat with me (or a mood of me) — 'talk' again (or 'hangup') to end",
          "  subscribe <email>  get new essays by email",
          "  play               a real, actually hard little game",
          "  sudo               try it",
          "  clear              wipe the screen",
        ]);
        break;
      case "about":
        print([
          "Former VC investor, now COO at Lumx building global B2B payments",
          "powered by stablecoins. Write about fintech, AI, business and startups.",
        ]);
        break;
      case "whoami":
        print(["guest — just someone poking around Jacobo's site. hi."]);
        break;
      case "skills":
        print(SKILLS.map((s) => `  - ${s}`));
        break;
      case "essays":
      case "posts":
      case "ls": {
        if (posts.length === 0) {
          print(["no essays yet."]);
          break;
        }
        const lines = posts.map((p, i) => (
          <a
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="block hover:text-primary transition-colors"
          >
            {`  ${i + 1}. [${p.date.slice(0, 10)}] ${p.title}`}
          </a>
        ));
        print(["", ...lines, "", "type 'open <n>' to read one"]);
        break;
      }
      case "open": {
        const n = Number(rest[0]);
        if (!n || n < 1 || n > posts.length) {
          print([`usage: open <1-${posts.length}> — run 'essays' to see the list`]);
          break;
        }
        router.push(`/blog/${posts[n - 1].slug}`);
        break;
      }
      case "contact":
        print(["email:    j@jacobodecal.com", "linkedin: linkedin.com/in/jacobodecal"]);
        break;
      case "hangup":
      case "end":
        if (callStatus === "connected" || callStatus === "connecting") {
          await conversation.endSession();
          setCallStatus("idle");
          print(["call ended."]);
        } else {
          print(["no active call."]);
        }
        break;
      case "talk": {
        if (callStatus === "connected" || callStatus === "connecting") {
          await conversation.endSession();
          setCallStatus("idle");
          print(["call ended."]);
          break;
        }
        const arg = rest[0] as Mood | undefined;
        const chosen: Mood = arg === "coffee" || arg === "skeptic" ? arg : "direct";
        print([`connecting (mood: ${chosen})...`]);
        printRef.current = print;
        setMood(chosen);
        setPendingTalk(true);
        break;
      }
      case "subscribe": {
        const email = rest[0];
        if (!email || !email.includes("@")) {
          print(["usage: subscribe you@email.com"]);
          break;
        }
        print(["subscribing..."]);
        try {
          const res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          print([res.ok ? "subscribed. welcome aboard." : `error: ${data.error || "something went wrong"}`]);
        } catch {
          print(["error: something went wrong. try again later."]);
        }
        break;
      }
      case "play":
        window.dispatchEvent(new CustomEvent("open-game"));
        print(["launching runner.exe..."]);
        break;
      case "sudo":
        print([
          `"${rest.join(" ") || "make me a sandwich"}"? nice try.`,
          "Permission denied: guest is not in the sudoers file.",
          "This incident will be reported (to nobody).",
        ]);
        break;
      case "coffee":
        print(["☕ here you go. back to work."]);
        break;
      case "clear":
        clear();
        break;
      default:
        print([`command not found: ${name}. type 'help'.`]);
    }
  };

  return (
    <TerminalShell
      title="jacobo@site: ~"
      boot={BOOT}
      onCommand={handleCommand}
    />
  );
}
