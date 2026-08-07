"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Silence before committing speech (ms). Short pauses won't trigger a reply. */
export const VOICE_PAUSE_MS = 1600;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionInstance)
  | null {
  if (typeof window === "undefined") return null;
  const scope = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/[•]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface UseVoiceChatOptions {
  lang?: string;
  /** How long to wait after the last speech before sending. Default 1600ms. */
  pauseMs?: number;
  onFinalTranscript?: (text: string) => void;
}

export function useVoiceChat(options?: UseVoiceChatOptions) {
  const pauseMs = options?.pauseMs ?? VOICE_PAUSE_MS;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWaitingForPause, setIsWaitingForPause] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedRef = useRef("");
  const interimRef = useRef("");
  const wantListeningRef = useRef(false);
  const pausedForReplyRef = useRef(false);
  const onFinalRef = useRef(options?.onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = options?.onFinalTranscript;
  }, [options?.onFinalTranscript]);

  useEffect(() => {
    setIsSupported(
      Boolean(getSpeechRecognitionConstructor()) &&
        typeof window !== "undefined" &&
        "speechSynthesis" in window
    );
  }, []);

  const clearPauseTimer = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    setIsWaitingForPause(false);
  }, []);

  const getBufferedText = useCallback(() => {
    return `${committedRef.current} ${interimRef.current}`.replace(/\s+/g, " ").trim();
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const commitBuffer = useCallback(() => {
    const text = getBufferedText();
    clearPauseTimer();
    committedRef.current = "";
    interimRef.current = "";
    setInterimTranscript("");

    if (!text) return;

    // Pause mic while the agent replies / speaks so TTS isn't re-captured
    pausedForReplyRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
    onFinalRef.current?.(text);
  }, [clearPauseTimer, getBufferedText]);

  const schedulePauseCommit = useCallback(() => {
    clearPauseTimer();
    if (!getBufferedText()) return;

    setIsWaitingForPause(true);
    pauseTimerRef.current = setTimeout(() => {
      pauseTimerRef.current = null;
      setIsWaitingForPause(false);
      commitBuffer();
    }, pauseMs);
  }, [clearPauseTimer, commitBuffer, getBufferedText, pauseMs]);

  const startRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition || !wantListeningRef.current) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options?.lang ?? "en-US";

    recognition.onresult = (event) => {
      if (pausedForReplyRef.current) return;

      let interim = "";
      let newlyFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) newlyFinal += transcript;
        else interim += transcript;
      }

      if (newlyFinal.trim()) {
        committedRef.current = `${committedRef.current} ${newlyFinal}`.replace(/\s+/g, " ").trim();
      }
      interimRef.current = interim;
      setInterimTranscript(getBufferedText());

      // Any speech activity resets the silence window
      if (getBufferedText()) {
        schedulePauseCommit();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      if (event.error === "not-allowed") {
        setVoiceError("Microphone permission denied.");
        wantListeningRef.current = false;
        setIsListening(false);
        setIsVoiceMode(false);
        clearPauseTimer();
        return;
      }
      setVoiceError("Could not capture voice input.");
    };

    recognition.onend = () => {
      // Browser often ends continuous sessions — restart while mic is still on
      if (wantListeningRef.current && !pausedForReplyRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
        }
        return;
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      setVoiceError(null);
    } catch {
      setVoiceError("Could not start the microphone.");
      setIsListening(false);
    }
  }, [clearPauseTimer, getBufferedText, options?.lang, schedulePauseCommit]);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    pausedForReplyRef.current = false;
    clearPauseTimer();
    committedRef.current = "";
    interimRef.current = "";
    setInterimTranscript("");
    try {
      recognitionRef.current?.abort();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
    setIsListening(false);
    setIsVoiceMode(false);
  }, [clearPauseTimer]);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setVoiceError("Voice is not supported in this browser.");
      return;
    }

    setVoiceError(null);
    stopSpeaking();
    wantListeningRef.current = true;
    setIsVoiceMode(true);
    pausedForReplyRef.current = false;
    committedRef.current = "";
    interimRef.current = "";
    setInterimTranscript("");
    clearPauseTimer();
    startRecognition();
  }, [clearPauseTimer, startRecognition, stopSpeaking]);

  const resumeListeningAfterReply = useCallback(() => {
    if (!wantListeningRef.current) return;
    pausedForReplyRef.current = false;
    committedRef.current = "";
    interimRef.current = "";
    setInterimTranscript("");
    clearPauseTimer();
    startRecognition();
  }, [clearPauseTimer, startRecognition]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !text.trim()) return;

      stopSpeaking();
      pausedForReplyRef.current = true;
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);

      const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Brief gap after TTS, then listen again if mic mode still on
        window.setTimeout(() => {
          resumeListeningAfterReply();
        }, 400);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resumeListeningAfterReply();
      };
      window.speechSynthesis.speak(utterance);
    },
    [resumeListeningAfterReply, stopSpeaking]
  );

  const toggleListening = useCallback(() => {
    if (wantListeningRef.current || isVoiceMode || isListening) {
      stopListening();
      return;
    }
    startListening();
  }, [isListening, isVoiceMode, startListening, stopListening]);

  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      clearPauseTimer();
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
      stopSpeaking();
    };
  }, [clearPauseTimer, stopSpeaking]);

  return {
    isSupported,
    isListening,
    isVoiceMode,
    isSpeaking,
    isWaitingForPause,
    pauseMs,
    interimTranscript,
    voiceError,
    autoSpeak,
    setAutoSpeak,
    startListening,
    stopListening,
    resumeListeningAfterReply,
    toggleListening,
    speak,
    stopSpeaking,
  };
}
