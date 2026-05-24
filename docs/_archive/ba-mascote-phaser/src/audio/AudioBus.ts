import type { AudioBusConfig } from "../core/types";

const DEFAULT_CONFIG: AudioBusConfig = {
  master: 0.45,
  ui: 0.25,
  action: 0.4,
  ambient: 0.14
};

export class AudioBus {
  private ctx: AudioContext | null = null;
  private config: AudioBusConfig;
  private ambientTimer: number | null = null;

  constructor(config?: Partial<AudioBusConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...(config ?? {}) };
  }

  arm(): void {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setConfig(next: Partial<AudioBusConfig>): void {
    this.config = { ...this.config, ...next };
  }

  playUI(kind: "tap" | "ok" | "warn"): void {
    if (!this.ctx) return;
    const variation = (Math.random() - 0.5) * 18;
    if (kind === "tap") this.tone(520 + variation, 0.04, this.config.ui * 0.7, "triangle");
    if (kind === "ok") {
      this.tone(620 + variation, 0.05, this.config.ui * 0.8, "triangle");
      this.tone(760 + variation, 0.06, this.config.ui * 0.6, "triangle", 0.04);
    }
    if (kind === "warn") this.tone(260 + variation, 0.08, this.config.ui * 0.8, "sawtooth");
  }

  playAction(kind: "buy" | "equip"): void {
    if (!this.ctx) return;
    const variation = (Math.random() - 0.5) * 14;
    if (kind === "buy") {
      this.tone(460 + variation, 0.05, this.config.action * 0.8, "triangle");
      this.tone(640 + variation, 0.07, this.config.action * 0.7, "triangle", 0.05);
    } else {
      this.tone(420 + variation, 0.05, this.config.action * 0.7, "sine");
      this.tone(540 + variation, 0.06, this.config.action * 0.6, "sine", 0.045);
    }
  }

  startAmbient(): void {
    if (!this.ctx || this.ambientTimer !== null) return;
    const loop = () => {
      if (!this.ctx) return;
      const base = [196, 220, 247, 294][Math.floor(Math.random() * 4)];
      this.tone(base, 1.1, this.config.ambient * 0.35, "sine");
      this.tone(base * 1.5, 0.9, this.config.ambient * 0.25, "triangle", 0.22);
      this.ambientTimer = window.setTimeout(loop, 5200 + Math.random() * 3000);
    };
    loop();
  }

  private tone(freq: number, duration: number, gainValue: number, type: OscillatorType, wait = 0): void {
    if (!this.ctx) return;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime + wait;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue * this.config.master), t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    oscillator.connect(gain);
    gain.connect(this.ctx.destination);
    oscillator.start(t);
    oscillator.stop(t + duration + 0.02);
  }
}
