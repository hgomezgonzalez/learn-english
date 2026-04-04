// Quiz sound effects using Web Audio API (no external files needed)
export function playCorrectSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Happy ascending tones
    osc.type = "sine";
    osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not available
  }
}

export function playWrongSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Descending buzz
    osc.type = "square";
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.setValueAtTime(250, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available
  }
}
