"use client";

import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "connected" | "error";

export default function VoiceAssistant() {
  const [status, setStatus] = useState<CallStatus>("idle");
  const vapiRef = useRef<Vapi | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Initialize Vapi client
    const vapi = new Vapi("c6a1e7ae-ab54-4e53-b746-3db91b098220");
    vapiRef.current = vapi;

    // Set up event listeners
    vapi.on("call-start", () => {
      console.log("Call started");
      setStatus("connected");
      setErrorMessage("");
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setStatus("idle");
    });

    vapi.on("error", (error: any) => {
      console.error("Vapi error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to connect");
      setTimeout(() => setStatus("idle"), 3000);
    });

    vapi.on("speech-start", () => {
      console.log("User started speaking");
    });

    vapi.on("speech-end", () => {
      console.log("User stopped speaking");
    });

    return () => {
      vapi.stop();
    };
  }, []);

  const handleClick = async () => {
    if (status === "idle") {
      setStatus("connecting");
      try {
        await vapiRef.current?.start("d163ffca-b0ae-4f3c-a60d-a6539d93481a");
      } catch (error: any) {
        console.error("Failed to start call:", error);
        setStatus("error");
        setErrorMessage(error.message || "Failed to start call");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } else if (status === "connected") {
      vapiRef.current?.stop();
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
