"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  onFinalTranscript?: (text: string) => void;
}

export function useVoiceChat(options?: UseVoiceChatOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
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

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !text.trim()) return;

      stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [stopSpeaking]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setVoiceError("Voice is not supported in this browser.");
      return;
    }

    setVoiceError(null);
    stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options?.lang ?? "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += transcript;
        else interim += transcript;
      }

      setInterimTranscript(interim || finalText);

      if (finalText.trim()) {
        onFinalRef.current?.(finalText.trim());
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setVoiceError(
          event.error === "not-allowed"
            ? "Microphone permission denied."
            : "Could not capture voice input."
        );
      }
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }, [options?.lang, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    isSupported,
    isListening,
    isSpeaking,
    interimTranscript,
    voiceError,
    autoSpeak,
    setAutoSpeak,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
  };
}
