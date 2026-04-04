"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, AvatarState } from "@/types";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export interface ScoreEvent {
  points: number;
  reason: string;
}

function extractScore(text: string): ScoreEvent | null {
  const match = text.match(/<!--SCORE:([\s\S]*?)-->/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function stripScoreTag(text: string): string {
  return text.replace(/<!--SCORE:[\s\S]*?-->/, "").trim();
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [lastScore, setLastScore] = useState<ScoreEvent | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setAvatarState("thinking");
      setError(null);

      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content },
      ];

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to get response");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let receivedFirstChunk = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              fullText += parsed.text;

              if (!receivedFirstChunk) {
                receivedFirstChunk = true;
                setAvatarState("speaking");
              }

              const displayText = stripScoreTag(fullText);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: displayText }
                    : m
                )
              );
            } catch {
              // skip malformed chunks
            }
          }
        }

        // Extract score
        const score = extractScore(fullText);
        if (score) {
          setLastScore(score);
          setTotalScore((prev) => prev + score.points);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
      } finally {
        setIsStreaming(false);
        setAvatarState("idle");
        abortRef.current = null;
      }
    },
    [messages, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setAvatarState("idle");
  }, []);

  return {
    messages,
    isStreaming,
    avatarState,
    error,
    totalScore,
    lastScore,
    sendMessage,
    stopStreaming,
  };
}
