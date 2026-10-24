"use client";

import { useEffect, useRef, useState } from "react";
import Game from "@/components/Game";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function KonamiGame() {
  const [open, setOpen] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = KONAMI[progress.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === expected) {
        // Suppress the keystroke so a mid-sequence arrow/letter doesn't also
        // land in the terminal's (almost always focused) command input.
        e.preventDefault();
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          setOpen(true);
          // preventDefault above should stop the sequence's own keys from
          // landing in the (almost always focused) terminal input, but
          // clear it too as a backstop in case anything still slipped in.
          window.dispatchEvent(new CustomEvent("konami-triggered"));
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    const handleOpenGame = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-game", handleOpenGame);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-game", handleOpenGame);
    };
  }, []);

  return <Game open={open} onClose={() => setOpen(false)} />;
}
