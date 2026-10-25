"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useConversation } from "@elevenlabs/react";

type CallStatus = "idle" | "connecting" | "connected" | "error";

export default function VoiceAssistant() {
  const pathname = usePathname();
  const [status, setStatus] = useState<CallStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Eleven Labs agent");
      setStatus("connected");
      setErrorMessage("");
    },
    onDisconnect: () => {
      console.log("Disconnected from agent");
      setStatus("idle");
    },
    onError: (error: string) => {
      console.error("Eleven Labs error:", error);
      setStatus("error");
      setErrorMessage(error || "Failed to connect");
      setTimeout(() => setStatus("idle"), 3000);
    },
    onMessage: (message: unknown) => {
      console.log("Message received:", message);
    },
  });

  const handleClick = async () => {
    if (status === "idle") {
      setStatus("connecting");
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Start conversation with Eleven Labs agent
        await conversation.startSession({
          agentId: "agent_4101kfc2vz2ae1cre64r0n0mcjk7",
          connectionType: "websocket",
        });
      } catch (error: unknown) {
        console.error("Failed to start conversation:", error);
        setStatus("error");
        const message = error instanceof Error ? error.message : "Failed to start conversation";
        setErrorMessage(message);
        setTimeout(() => setStatus("idle"), 3000);
      }
    } else if (status === "connected") {
      await conversation.endSession();
      setStatus("idle");
    }
  };

  const getButtonText = () => {
    switch (status) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "End Call";
      case "error":
        return errorMessage || "Error";
      default:
        return "Talk to Jacobo";
    }
  };

  // Public-site widget only; it would cover the editor in /admin
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      <button
        onClick={handleClick}
        disabled={status === "connecting"}
        className={`flex items-center gap-2.5 rounded-full border bg-surface/90 py-2 pr-4 pl-2 text-sm font-medium shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur transition-colors ${
          status === "error"
            ? "border-danger/40 text-danger"
            : status === "connected"
            ? "border-danger/40 text-foreground"
            : "border-line-strong text-foreground hover:border-muted"
        } disabled:cursor-not-allowed disabled:opacity-70`}
      >
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
          status === "error" || status === "connected"
            ? "bg-danger/90"
            : "bg-success/90"
        }`}>
          <svg
            className="h-3.5 w-3.5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </span>
        <span>{getButtonText()}</span>
      </button>
    </div>
  );
}
