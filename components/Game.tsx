"use client";

import { useEffect, useRef, useState } from "react";

const WIDTH = 640;
const HEIGHT = 320;
const GROUND_Y = HEIGHT - 40;
const GRAVITY = 0.0032; // px per ms^2
const JUMP_VELOCITY = -0.85; // px per ms
const PLAYER_X = 70;
const PLAYER_W = 26;
const PLAYER_H_STAND = 34;
const PLAYER_H_DUCK = 18;
const HIGH_SCORE_KEY = "runner-highscore";

type Obstacle = {
  x: number;
  width: number;
  height: number;
  y: number;
  kind: "bug" | "exception";
  passed: boolean;
};

type Collectible = {
  x: number;
  y: number;
  taken: boolean;
};

export default function Game({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  const stateRef = useRef({
    playerY: GROUND_Y - PLAYER_H_STAND,
    velocityY: 0,
    ducking: false,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    speed: 0.28, // px per ms
    distance: 0,
    bonus: 0,
    nextSpawn: 0,
    lastTime: 0,
    over: false,
    running: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    setHighScore(stored);
  }, []);

  const reset = () => {
    stateRef.current = {
      playerY: GROUND_Y - PLAYER_H_STAND,
      velocityY: 0,
      ducking: false,
      obstacles: [],
      collectibles: [],
      speed: 0.28,
      distance: 0,
      bonus: 0,
      nextSpawn: 800,
      lastTime: 0,
      over: false,
      running: true,
    };
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  useEffect(() => {
    if (!open) {
      stateRef.current.running = false;
      setStarted(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const keys = new Set<string>();

    const jump = () => {
      const s = stateRef.current;
      if (!s.running) return;
      if (s.playerY >= GROUND_Y - PLAYER_H_STAND - 1 && !s.ducking) {
        s.velocityY = JUMP_VELOCITY;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (!started || gameOver) {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowUp") {
          e.preventDefault();
          reset();
        }
        return;
      }
      if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        jump();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        stateRef.current.ducking = true;
      }
      keys.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") stateRef.current.ducking = false;
      keys.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const spawnObstacle = () => {
      const s = stateRef.current;
      const kind: "bug" | "exception" = Math.random() < 0.65 ? "bug" : "exception";
      if (kind === "bug") {
        s.obstacles.push({
          x: WIDTH + 20,
          width: 22,
          height: 32,
          y: GROUND_Y - 32,
          kind,
          passed: false,
        });
      } else {
        s.obstacles.push({
          x: WIDTH + 20,
          width: 40,
          height: 20,
          y: GROUND_Y - PLAYER_H_STAND - 20,
          kind,
          passed: false,
        });
      }
      if (Math.random() < 0.4) {
        s.collectibles.push({
          x: WIDTH + 60,
          y: GROUND_Y - PLAYER_H_STAND - 46,
          taken: false,
        });
      }
      const minGap = Math.max(420, 900 - s.speed * 600);
      s.nextSpawn = minGap + Math.random() * 400;
    };

    const rectsOverlap = (
      ax: number, ay: number, aw: number, ah: number,
      bx: number, by: number, bw: number, bh: number
    ) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

    const tick = (time: number) => {
      // Belt-and-suspenders: self-terminate on the very next frame after
      // `open` flips false, instead of relying solely on effect-cleanup
      // timing to cancel the loop.
      if (!openRef.current) return;
      const s = stateRef.current;
      if (!s.lastTime) s.lastTime = time;
      const dt = Math.min(time - s.lastTime, 40);
      s.lastTime = time;

      if (s.running) {
        s.velocityY += GRAVITY * dt;
        s.playerY += s.velocityY * dt;
        if (s.playerY > GROUND_Y - PLAYER_H_STAND) {
          s.playerY = GROUND_Y - PLAYER_H_STAND;
          s.velocityY = 0;
        }

        s.speed = Math.min(0.65, 0.28 + s.distance / 40000);
        s.distance += s.speed * dt;
        s.nextSpawn -= dt;
        if (s.nextSpawn <= 0) spawnObstacle();

        const playerH = s.ducking && s.playerY >= GROUND_Y - PLAYER_H_STAND - 1 ? PLAYER_H_DUCK : PLAYER_H_STAND;
        const playerY = s.ducking && s.playerY >= GROUND_Y - PLAYER_H_STAND - 1 ? GROUND_Y - PLAYER_H_DUCK : s.playerY;

        for (const o of s.obstacles) {
          o.x -= s.speed * dt;
          if (rectsOverlap(PLAYER_X, playerY, PLAYER_W, playerH, o.x, o.y, o.width, o.height)) {
            s.over = true;
            s.running = false;
          }
        }
        for (const c of s.collectibles) {
          c.x -= s.speed * dt;
          if (!c.taken && rectsOverlap(PLAYER_X, playerY, PLAYER_W, playerH, c.x, c.y, 18, 18)) {
            c.taken = true;
            s.bonus += 25;
          }
        }
        s.obstacles = s.obstacles.filter((o) => o.x + o.width > -20);
        s.collectibles = s.collectibles.filter((c) => c.x > -20 && !c.taken);

        const newScore = Math.floor(s.distance / 20) + s.bonus;
        setScore(newScore);

        if (s.over) {
          setGameOver(true);
          setHighScore((prev) => {
            const best = Math.max(prev, newScore);
            localStorage.setItem(HIGH_SCORE_KEY, String(best));
            return best;
          });
        }
      }

      // render
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "#2a2a2a";
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(WIDTH, GROUND_Y);
      ctx.stroke();

      const playerH = s.ducking && s.playerY >= GROUND_Y - PLAYER_H_STAND - 1 ? PLAYER_H_DUCK : PLAYER_H_STAND;
      const playerY = s.ducking && s.playerY >= GROUND_Y - PLAYER_H_STAND - 1 ? GROUND_Y - PLAYER_H_DUCK : s.playerY;
      ctx.fillStyle = "#61afef";
      ctx.fillRect(PLAYER_X, playerY, PLAYER_W, playerH);

      for (const o of s.obstacles) {
        ctx.fillStyle = o.kind === "bug" ? "#e06c75" : "#e5c07b";
        ctx.fillRect(o.x, o.y, o.width, o.height);
      }
      ctx.fillStyle = "#e8e6e2";
      ctx.font = "16px monospace";
      for (const c of s.collectibles) {
        if (!c.taken) ctx.fillText("+", c.x + 4, c.y + 14);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, started, gameOver]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm text-text-light">
            runner.exe — score: <span className="text-primary">{score}</span> · best:{" "}
            <span className="text-primary">{highScore}</span>
          </span>
          <button onClick={onClose} className="text-text-secondary hover:text-foreground text-sm">
            [ESC] close
          </button>
        </div>
        <div className="relative">
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block max-w-full" />
          {!started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-center px-4">
              <p className="text-foreground text-lg font-semibold">dodge bugs. duck exceptions. grab bonus points.</p>
              <p className="text-text-secondary text-sm">↑/Space jump · ↓ duck · Esc exit</p>
              <p className="text-primary text-sm mt-2">press Space to start</p>
            </div>
          )}
          {started && gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-center px-4">
              <p className="text-foreground text-lg font-semibold">segmentation fault (game over)</p>
              <p className="text-text-secondary text-sm">
                score: {score} {score >= highScore && score > 0 ? "— new best!" : `· best: ${highScore}`}
              </p>
              <p className="text-primary text-sm mt-2">press Space to run it back</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
