"use client";

import { useEffect, useRef, useState } from "react";
import type { PostMetadata } from "@/lib/posts";
import Terminal from "@/components/Terminal";
import VoiceAssistant from "@/components/VoiceAssistant";
import Game from "@/components/Game";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function SiteWidgets({ posts }: { posts: PostMetadata[] }) {
  const [gameOpen, setGameOpen] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI[progress.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          setGameOpen(true);
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Terminal posts={posts} onPlay={() => setGameOpen(true)} />
      <VoiceAssistant />
      <Game open={gameOpen} onClose={() => setGameOpen(false)} />
    </>
  );
}
