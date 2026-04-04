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
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

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

    synth.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;

      // Select a female English voice
      const voices = synth.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (/female/i.test(v.name) || /zira|samantha|karen|victoria|fiona|susan|hazel|linda|jenny|aria/i.test(v.name))
      ) || voices.find(
        (v) => v.lang.startsWith("en") && /woman|girl/i.test(v.name)
      ) || voices.find(
        (v) => v.lang.startsWith("en-US")
      );

      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
    }, 100);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isListening, isSpeaking, toggleListening, speak, stopSpeaking };
}
