"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceOptions {
  onTranscript: (text: string) => void;
  lang?: string;
}

interface SpeechRecognitionEvent {
  results: { [key: number]: { [key: number]: { transcript: string } }; length: number };
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useVoice({ onTranscript, lang = "en-US" }: UseVoiceOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSttSupported(false);
      return;
    }
    setSttSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [lang, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const wasSpeaking = synth.speaking || synth.pending;

    if (wasSpeaking) {
      synth.cancel();
      try { synth.resume(); } catch {}
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;

    const voices = synth.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (/female/i.test(v.name) || /samantha|karen|victoria|fiona|susan|hazel|linda|jenny|aria|moira/i.test(v.name))
    ) || voices.find((v) => v.lang === "en-US")
      || voices.find((v) => v.lang.startsWith("en"));

    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const setupKeepAlive = () => {
      if (text.length > 100) {
        const keepAlive = setInterval(() => {
          if (!synth.speaking) { clearInterval(keepAlive); }
          else { synth.pause(); synth.resume(); }
        }, 10000);
        utterance.onend = () => { setIsSpeaking(false); clearInterval(keepAlive); };
        utterance.onerror = () => { setIsSpeaking(false); clearInterval(keepAlive); };
      }
    };

    // iOS requires synchronous speak from gesture — no delay allowed
    // Chrome desktop needs a brief delay after cancel() or speak is silently dropped
    if (!isIOS && wasSpeaking) {
      setTimeout(() => {
        synth.speak(utterance);
        setupKeepAlive();
      }, 80);
    } else {
      synth.speak(utterance);
      setupKeepAlive();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, sttSupported, toggleListening, speak, stopSpeaking };
}
