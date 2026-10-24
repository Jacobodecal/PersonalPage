"use client";

import { useState } from "react";
import { useConversation } from "@elevenlabs/react";

type CallStatus = "idle" | "connecting" | "connected" | "error";

export default function VoiceAssistant() {
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        disabled={status === "connecting"}
        className={`flex items-center gap-3 px-6 py-3 bg-white border-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-medium ${
          status === "error"
            ? "border-red-300 text-red-600"
            : status === "connected"
            ? "border-red-300 text-gray-900"
            : "border-gray-200 text-gray-900"
        } disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
          status === "error"
            ? "bg-red-500"
            : status === "connected"
            ? "bg-red-500"
            : "bg-green-500"
        }`}>
          <svg
            className="w-4 h-4 text-white"
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
        <span className="text-base">{getButtonText()}</span>
      </button>
    </div>
  );
}
