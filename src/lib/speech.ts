// Speech helper — compatible with iOS Safari, Chrome, Edge, Firefox
// iOS requires speak() to be called synchronously from a user gesture.
// No setTimeout between tap and speak().

let cachedVoice: SpeechSynthesisVoice | null = null;
let audioUnlocked = false;

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
// On desktop Chrome, speaking an empty utterance can corrupt the synth queue.
export function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  // iOS needs a real speak() call from a gesture to unlock
  const u = new SpeechSynthesisUtterance("");
  u.volume = 0;
  synth.speak(u);
}

// Pre-load voices
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

function doSpeak(text: string, rate: number) {
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

  // Speak synchronously — required for both iOS and Chrome user gesture context
  synth.speak(utterance);

  // Chrome keepalive for long texts (prevents 15s timeout)
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

// Speak a word — repeats it so user catches it clearly
export function speakWord(text: string) {
  doSpeak(`${text} ... ${text}`, 0.8);
}

// Speak a sentence
export function speakSentence(text: string) {
  doSpeak(text, 0.9);
}
