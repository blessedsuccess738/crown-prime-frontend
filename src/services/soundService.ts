// Sound Service — uses Web Audio API for generated sounds (no external files needed)
class SoundService {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private musicEnabled = true;
  private musicNode: OscillatorNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return this.ctx;
  }

  setEnabled(v: boolean) { this.enabled = v; }
  setMusicEnabled(v: boolean) { this.musicEnabled = v; if (!v) this.stopMusic(); }

  private play(freq: number, type: OscillatorType = 'sine', duration = 0.15, gain = 0.3, delay = 0) {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gainNode.gain.setValueAtTime(gain, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch {}
  }

  win() {
    this.play(523, 'sine', 0.1, 0.4);
    this.play(659, 'sine', 0.1, 0.4, 0.1);
    this.play(784, 'sine', 0.2, 0.4, 0.2);
    this.play(1047, 'sine', 0.3, 0.4, 0.35);
  }

  bigWin() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.play(f, 'sine', 0.15, 0.5, i * 0.08));
  }

  lose() {
    this.play(300, 'sawtooth', 0.1, 0.2);
    this.play(200, 'sawtooth', 0.2, 0.2, 0.12);
  }

  click() { this.play(800, 'sine', 0.05, 0.1); }
  coin() { this.play(1200, 'sine', 0.08, 0.2); this.play(1500, 'sine', 0.06, 0.15, 0.05); }
  spin() { this.play(400, 'square', 0.05, 0.15); }
  cashout() { this.play(880, 'sine', 0.1, 0.3); this.play(1100, 'sine', 0.15, 0.3, 0.1); }
  bomb() { this.play(100, 'sawtooth', 0.3, 0.4); this.play(80, 'square', 0.2, 0.3, 0.1); }
  notification() { this.play(660, 'sine', 0.08, 0.2); this.play(880, 'sine', 0.06, 0.2, 0.1); }
  deal() { this.play(600, 'sine', 0.06, 0.15); }
  countdown() { this.play(440, 'square', 0.05, 0.1); }
  crash_() { this.play(150, 'sawtooth', 0.4, 0.5); this.play(100, 'square', 0.3, 0.4, 0.2); }

  playSlotSpin() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.play(300 + i * 50, 'square', 0.05, 0.1), i * 80);
    }
  }

  startMusic() {
    if (!this.musicEnabled || this.musicNode) return;
    try {
      const ctx = this.getCtx();
      // Simple ambient drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      osc.start();
      this.musicNode = osc;
    } catch {}
  }

  stopMusic() {
    try { this.musicNode?.stop(); this.musicNode = null; } catch {}
  }
}

export const sound = new SoundService();
