"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useInventoryChat } from "@/hooks/use-inventory-chat";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { isAdmin } from "@/lib/auth";
import { useAuth } from "@/context/auth-provider";

const SUGGESTIONS = {
  admin: [
    "Add 50 safety gloves to Warehouse A",
    "Regenerate image for safety gloves, blue packaging",
    "Summarize inventory health",
  ],
  user: [
    "Add 20 printer paper reams to Warehouse A",
    "Change the photo for wireless mouse, black matte finish",
    "What should I restock first?",
  ],
};

export function AIChatPanel() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const { messages, sendInventoryMessage, status, error, provider } =
    useInventoryChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  const isBusy = status === "submitted";

  const {
    isSupported: voiceSupported,
    isListening,
    isSpeaking,
    interimTranscript,
    voiceError,
    autoSpeak,
    setAutoSpeak,
    toggleListening,
    speak,
    stopSpeaking,
  } = useVoiceChat({
    onFinalTranscript: (text) => {
      setInput(text);
      void handleSend(text);
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, interimTranscript]);

  useEffect(() => {
    if (!autoSpeak || !open) return;
    const last = messages.at(-1);
    if (!last || last.role !== "assistant" || status !== "ready") return;
    if (last.id === lastSpokenIdRef.current) return;

    lastSpokenIdRef.current = last.id;
    speak(last.content);
  }, [messages, status, autoSpeak, open, speak]);

  useEffect(() => {
    if (!open) {
      stopSpeaking();
      lastSpokenIdRef.current = null;
    }
  }, [open, stopSpeaking]);

  const suggestions = admin ? SUGGESTIONS.admin : SUGGESTIONS.user;

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    stopSpeaking();
    await sendInventoryMessage(trimmed);
  }

  const inputValue = isListening ? interimTranscript || input : input;

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
                {provider ? `${provider} · ` : ""}
                {admin ? "Admin" : "User"} mode
                {isListening ? " · Listening…" : isSpeaking ? " · Speaking…" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {voiceSupported && (
              <button
                type="button"
                onClick={() => setAutoSpeak((value) => !value)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  autoSpeak
                    ? "bg-accent-primary-light text-accent-primary"
                    : "text-text-muted hover:bg-surface-hover"
                }`}
                aria-label={autoSpeak ? "Disable spoken replies" : "Enable spoken replies"}
                title={autoSpeak ? "Spoken replies on" : "Spoken replies off"}
              >
                {autoSpeak ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
                Type, use the mic, or run actions — e.g. &quot;Add 20 safety gloves&quot;
              </p>
              {voiceSupported && (
                <p className="mt-1 text-[11px] text-accent-primary">
                  Voice flow: tap mic → speak → hear the reply
                </p>
              )}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void handleSend(s)}
                    disabled={isBusy || isListening}
                    className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent-primary/30 hover:text-accent-primary disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group relative max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-accent-primary text-white"
                      : "border border-border bg-surface text-text-secondary"
                  }`}
                >
                  {message.content}
                  {!isUser && voiceSupported && (
                    <button
                      type="button"
                      onClick={() => speak(message.content)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-accent-primary opacity-80 transition-opacity hover:bg-accent-primary-light hover:opacity-100"
                    >
                      <Volume2 className="h-3 w-3" />
                      Listen
                    </button>
                  )}
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

          {(error || voiceError) && (
            <p className="rounded-lg bg-accent-danger-light px-3 py-2 text-xs text-accent-danger">
              {voiceError ?? error?.message}
            </p>
          )}
        </div>

        <form
          className="shrink-0 border-t border-border bg-surface-elevated p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend(inputValue);
          }}
        >
          {messages.length > 0 && (
            <div className="mb-2.5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Suggested
              </p>
              <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void handleSend(s)}
                    disabled={isBusy || isListening}
                    className="shrink-0 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:border-accent-primary/30 hover:bg-accent-primary-light hover:text-accent-primary disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isListening && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-accent-primary/30 bg-accent-primary-light/50 px-3 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-primary" />
              </span>
              <p className="text-xs font-medium text-accent-primary">
                Listening… speak your request
              </p>
            </div>
          )}

          <div className="flex items-end gap-2">
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isBusy}
                className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition-colors disabled:opacity-40 ${
                  isListening
                    ? "border-accent-danger/40 bg-accent-danger-light text-accent-danger"
                    : "border-border bg-surface text-text-secondary hover:border-accent-primary/30 hover:bg-accent-primary-light hover:text-accent-primary"
                }`}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}
            <textarea
              value={inputValue}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(inputValue);
                }
              }}
              rows={1}
              placeholder={
                voiceSupported
                  ? "Type or tap the mic to speak…"
                  : "Ask about stock, alerts, activity…"
              }
              disabled={isBusy || isListening}
              readOnly={isListening}
              className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary/50 focus:ring-2 focus:ring-accent-primary/15 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isBusy || isListening || !inputValue.trim()}
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
