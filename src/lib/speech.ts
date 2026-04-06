// Speech helper — compatible with iOS Safari, Chrome, Edge, Firefox
// iOS uses Web Speech API (requires synchronous speak from gesture).
// Desktop uses server-side TTS via /api/tts for reliability.

let cachedVoice: SpeechSynthesisVoice | null = null;
let audioUnlocked = false;
let currentAudio: HTMLAudioElement | null = null;

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  cachedVoice =
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (/female/i.test(v.name) ||
          /samantha|karen|victoria|fiona|susan|hazel|linda|jenny|aria|google us|moira/i.test(v.name))
    ) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;

  return cachedVoice;
}

// Must be called from a user gesture (click/tap) to unlock iOS audio.
export function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  if (!isIOS()) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  const u = new SpeechSynthesisUtterance("");
  u.volume = 0;
  synth.speak(u);
}

// Pre-load voices (for iOS Web Speech API)
export function initVoices(): Promise<void> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) { resolve(); return; }

    const voices = synth.getVoices();
    if (voices.length > 0) {
      getEnglishVoice();
      resolve();
      return;
    }

    synth.onvoiceschanged = () => {
      getEnglishVoice();
      synth.onvoiceschanged = null;
      resolve();
    };

    setTimeout(resolve, 2000);
  });
}

// --- Desktop TTS via server endpoint ---

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]*/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const part of parts) {
    if ((current + part).length > 180) {
      if (current) chunks.push(current.trim());
      current = part;
    } else {
      current += part;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function playServerTTS(text: string, rate: number) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const chunks = splitSentences(text);
  let index = 0;

  function playNext() {
    if (index >= chunks.length) {
      currentAudio = null;
      return;
    }
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(chunks[index])}`);
    audio.playbackRate = rate;
    currentAudio = audio;
    audio.onended = () => { index++; playNext(); };
    audio.onerror = () => { index++; playNext(); };
    audio.play().catch(() => { index++; playNext(); });
  }

  playNext();
}

// Stop any playing server TTS audio
export function stopServerTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

// --- iOS TTS via Web Speech API ---

function playWebSpeechTTS(text: string, rate: number) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();
  try { synth.resume(); } catch {}

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voice = getEnglishVoice();
  if (voice) utterance.voice = voice;

  synth.speak(utterance);

  if (text.length > 50) {
    const keepAlive = setInterval(() => {
      if (!synth.speaking) {
        clearInterval(keepAlive);
      } else {
        synth.pause();
        synth.resume();
      }
    }, 10000);
    utterance.onend = () => clearInterval(keepAlive);
    utterance.onerror = () => clearInterval(keepAlive);
  }
}

// --- Public API ---

function doSpeak(text: string, rate: number) {
  if (isIOS()) {
    playWebSpeechTTS(text, rate);
  } else {
    playServerTTS(text, rate);
  }
}

export function speakWord(text: string) {
  doSpeak(`${text} ... ${text}`, 0.8);
}

export function speakSentence(text: string) {
  doSpeak(text, 0.9);
}
