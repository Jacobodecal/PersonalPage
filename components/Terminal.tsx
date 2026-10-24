"use client";

import { useEffect, useRef, useState } from "react";
import type { PostMetadata } from "@/lib/posts";

type Line = { type: "input" | "output"; text: string };

const WELCOME: Line[] = [
  { type: "output", text: "jacobodecal.com [version 2026.1]" },
  { type: "output", text: "type 'help' to see what this thing can do." },
];

const SKILLS = [
  "TypeScript / Next.js / React",
  "Postgres, Supabase, pipelines that don't fall over",
  "prompt wrangling & agent orchestration",
  "stablecoin rails & B2B payments infra",
  "still can't design a logo to save my life",
];

export default function Terminal({ posts, onPlay }: { posts: PostMetadata[]; onPlay: () => void }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const print = (lines: string[]) => {
    setHistory((h) => [...h, ...lines.map((text) => ({ type: "output" as const, text }))]);
  };

  const run = (raw: string) => {
    const cmd = raw.trim();
    setHistory((h) => [...h, { type: "input", text: cmd }]);
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);

    switch (name) {
      case "":
        break;
      case "help":
        print([
          "available commands:",
          "  whoami     who's typing this, technically",
          "  about      the short version",
          "  skills     what I'm actually good at",
          "  essays     everything I've written",
          "  contact    how to reach me",
          "  play       a real, actually hard little game",
          "  sudo       try it",
          "  clear      wipe the screen",
          "  exit       close this thing",
        ]);
        break;
      case "whoami":
        print(["guest — just someone poking around Jacobo's site. hi."]);
        break;
      case "about":
        print([
          "Former VC investor, now COO at Lumx building global B2B payments",
          "powered by stablecoins. Write about fintech, AI, business and startups.",
          "This terminal exists because a normal 'About' section felt boring.",
        ]);
        break;
      case "skills":
        print(SKILLS.map((s) => `  - ${s}`));
        break;
      case "essays":
      case "posts":
      case "ls":
        if (posts.length === 0) {
          print(["no essays yet."]);
        } else {
          print(posts.map((p) => `  ${p.date.slice(0, 10)}  ${p.title}  -> /blog/${p.slug}`));
        }
        break;
      case "contact":
        print(["email:    j@jacobodecal.com", "linkedin: linkedin.com/in/jacobodecal"]);
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
      case "play":
        print(["launching runner.exe..."]);
        setOpen(false);
        onPlay();
        return;
      case "clear":
        setHistory([]);
        return;
      case "exit":
        setOpen(false);
        return;
      default:
        print([`command not found: ${name}. type 'help'.`]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    run(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {open && (
        <div className="mb-3 w-[min(90vw,420px)] h-[420px] bg-surface border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="ml-2 text-xs text-text-light">guest@jacobodecal.com</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 text-sm space-y-1">
            {history.map((line, i) => (
              <div key={i} className={line.type === "input" ? "text-foreground" : "text-text-secondary"}>
                {line.type === "input" ? (
                  <span>
                    <span className="text-primary">guest@site:~$</span> {line.text}
                  </span>
                ) : (
                  line.text
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
            <span className="text-primary text-sm">guest@site:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <span
              className="w-2 h-4 bg-primary"
              style={{ animation: "blink-cursor 1s step-end infinite" }}
            />
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-5 py-3 bg-surface border-2 border-border rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 text-foreground font-medium"
      >
        <span className="text-primary">&gt;_</span>
        <span className="text-base">{open ? "Close" : "Terminal"}</span>
      </button>
    </div>
  );
}
