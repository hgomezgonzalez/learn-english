// Robust speech helper - works across Chrome, Edge, Firefox

let voicesLoaded = false;
let cachedVoice: SpeechSynthesisVoice | null = null;
let synthWarmedUp = false;

function getEnglishFemaleVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const female = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (/female/i.test(v.name) ||
        /zira|samantha|karen|victoria|fiona|susan|hazel|linda|jenny|aria|google us/i.test(v.name))
  );

  cachedVoice =
    female ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;

  return cachedVoice;
}

// Pre-load voices (call once on app mount)
export function initVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (voicesLoaded) {
      resolve();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      getEnglishFemaleVoice();
      resolve();
      return;
    }

    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      getEnglishFemaleVoice();
      window.speechSynthesis.onvoiceschanged = null;
      resolve();
    };

    // Timeout fallback
    setTimeout(() => {
      voicesLoaded = true;
      resolve();
    }, 2000);
  });
}

function createUtterance(text: string, rate: number): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  const voice = getEnglishFemaleVoice();
  if (voice) utterance.voice = voice;
  return utterance;
}

function resetAndSpeak(utterance: SpeechSynthesisUtterance) {
  const synth = window.speechSynthesis;
  synth.cancel();
  try { synth.resume(); } catch {}
  // Let Chrome fully reset, then speak
  setTimeout(() => {
    synth.speak(utterance);
  }, 300);
}

// Speak a word — prepend the word itself so nothing important is lost
export function speakWord(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  // "word. ... word" — first instance warms up audio, second is the clean one
  const fullText = `${text}. ... ${text}`;
  const utterance = createUtterance(fullText, 0.8);
  resetAndSpeak(utterance);
}

// Speak a sentence — no tricks needed, just ensure synth is reset
export function speakSentence(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  const utterance = createUtterance(text, 0.9);
  resetAndSpeak(utterance);

  // Chrome bug: pauses long speech after ~15s
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
