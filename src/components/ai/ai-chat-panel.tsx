"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useInventoryChat } from "@/hooks/use-inventory-chat";
import { isAdmin } from "@/lib/auth";
import { useAuth } from "@/context/auth-provider";

const SUGGESTIONS = {
  admin: [
    "Summarize inventory health",
    "What should we restock first?",
    "Who has the most low-stock items?",
  ],
  user: [
    "Summarize my inventory",
    "What should I restock first?",
    "Show recent activity",
  ],
};

function getMessageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("");
}

export function AIChatPanel() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { messages, sendInventoryMessage, status, error } = useInventoryChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const isBusy = status === "submitted" || status === "streaming";
  const suggestions = admin ? SUGGESTIONS.admin : SUGGESTIONS.user;

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    await sendInventoryMessage(trimmed);
  }

  const panel = (
    <div className="fixed inset-0 z-[250] flex items-end justify-end p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={() => setOpen(false)}
        aria-label="Close AI assistant"
      />
      <div
        className="relative flex h-[min(640px,calc(100dvh-1rem))] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-surface-elevated shadow-2xl sm:rounded-2xl"
        role="dialog"
        aria-label="StockFlow AI Assistant"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-accent-primary-light/40 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">StockFlow AI</p>
              <p className="text-[10px] text-text-muted">
                Inventory assistant · {admin ? "Admin" : "User"} mode
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-5 text-center">
              <Bot className="mx-auto mb-2 h-8 w-8 text-accent-primary" />
              <p className="text-sm font-semibold text-text-primary">
                Ask about your inventory
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Summaries, restock priorities, activity, and more.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent-primary/30 hover:text-accent-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = getMessageText(message.parts);
            if (!text) return null;
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-accent-primary text-white"
                      : "border border-border bg-surface text-text-secondary"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {isBusy && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text-muted">
                Thinking…
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-accent-danger-light px-3 py-2 text-xs text-accent-danger">
              {error.message}
            </p>
          )}
        </div>

        <form
          className="shrink-0 border-t border-border bg-surface-elevated p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(input);
          }}
        >
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(input);
                }
              }}
              rows={1}
              placeholder="Ask about stock, alerts, activity…"
              disabled={isBusy}
              className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-accent-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:border-accent-primary/30 hover:bg-accent-primary-light hover:text-accent-primary"
        aria-label="Open AI assistant"
      >
        <Sparkles className="h-4 w-4" />
      </button>

      {mounted && open && createPortal(panel, document.body)}
    </>
  );
}
