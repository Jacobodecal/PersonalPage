"use client";

import { useEffect, useRef, useState } from "react";

type Entry = { id: number; kind: "boot" | "input" | "output"; content: React.ReactNode };

export type PrintFn = (lines: React.ReactNode[]) => void;

let idCounter = 0;
const nextId = () => idCounter++;

export default function TerminalShell({
  title,
  boot,
  prompt = "guest@jacobodecal:~$",
  onCommand,
  onReady,
  afterBoot,
}: {
  title: string;
  boot: string[];
  prompt?: string;
  onCommand: (cmd: string, ctx: { print: PrintFn; clear: () => void }) => void;
  onReady?: (ctx: { print: PrintFn; clear: () => void }) => void;
  afterBoot?: React.ReactNode;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [phase, setPhase] = useState<"booting" | "ready">("booting");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const bootDone = useRef(false);

  const print: PrintFn = (lines) => {
    setEntries((prev) => [
      ...prev,
      ...lines.map((content) => ({ id: nextId(), kind: "output" as const, content })),
    ]);
  };

  const clear = () => setEntries([]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  useEffect(() => {
    let cancelled = false;
    let skip = false;
    const requestSkip = () => {
      skip = true;
    };
    window.addEventListener("keydown", requestSkip);
    window.addEventListener("pointerdown", requestSkip);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, skip ? 0 : ms));

    async function typeBoot() {
      for (const line of boot) {
        if (cancelled) return;
        const id = nextId();
        setEntries((prev) => [...prev, { id, kind: "boot", content: "" }]);

        if (line === "") {
          await sleep(180);
          continue;
        }

        for (let i = 0; i <= line.length; i++) {
          if (cancelled) return;
          if (skip) {
            setEntries((prev) =>
              prev.map((e) => (e.id === id ? { ...e, content: line } : e))
            );
            break;
          }
          const chunk = line.slice(0, i);
          setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, content: chunk } : e)));
          await sleep(14 + Math.random() * 22);
        }
        await sleep(120);
      }
      if (cancelled) return;
      bootDone.current = true;
      setPhase("ready");
    }

    typeBoot();
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", requestSkip);
      window.removeEventListener("pointerdown", requestSkip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Deferred: the browser's own default key-insertion for this same
    // keystroke can still land after this handler runs, so clear on the
    // next tick rather than synchronously (otherwise it gets overwritten).
    const clearInput = () => setTimeout(() => setInput(""), 0);
    window.addEventListener("konami-triggered", clearInput);
    return () => window.removeEventListener("konami-triggered", clearInput);
  }, []);

  useEffect(() => {
    if (phase === "ready") {
      inputRef.current?.focus();
      onReady?.({ print, clear });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input;
    setEntries((prev) => [...prev, { id: nextId(), kind: "input", content: cmd }]);
    if (cmd.trim()) setHistory((h) => [...h, cmd]);
    historyIndex.current = -1;
    setInput("");
    onCommand(cmd, { print, clear });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex.current === -1 ? history.length - 1 : Math.max(0, historyIndex.current - 1);
      historyIndex.current = nextIndex;
      setInput(history[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex.current === -1) return;
      const nextIndex = historyIndex.current + 1;
      if (nextIndex >= history.length) {
        historyIndex.current = -1;
        setInput("");
      } else {
        historyIndex.current = nextIndex;
        setInput(history[nextIndex]);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0 sticky top-0 bg-background z-10">
        <span className="w-3 h-3 rounded-full bg-danger/70" />
        <span className="w-3 h-3 rounded-full bg-[#e5c07b]/70" />
        <span className="w-3 h-3 rounded-full bg-success/70" />
        <span className="ml-2 text-xs text-text-light truncate">{title}</span>
      </div>

      <div className="flex-1 px-4 md:px-8 py-6 text-sm md:text-[15px] leading-relaxed max-w-3xl w-full mx-auto">
        {entries.map((e) => (
          <div
            key={e.id}
            className={
              e.kind === "input"
                ? "text-foreground"
                : e.kind === "boot"
                ? "text-foreground whitespace-pre-wrap"
                : "text-text-secondary whitespace-pre-wrap"
            }
          >
            {e.kind === "input" ? (
              <span>
                <span className="text-primary">{prompt}</span> {e.content}
              </span>
            ) : (
              e.content
            )}
          </div>
        ))}
        {phase === "ready" && afterBoot}
        <div ref={endRef} />

        {phase === "ready" && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
            <span className="text-primary shrink-0">{prompt}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-foreground min-w-0"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <span
              className="w-2 h-4 bg-primary shrink-0"
              style={{ animation: "blink-cursor 1s step-end infinite" }}
            />
          </form>
        )}
      </div>
    </div>
  );
}
