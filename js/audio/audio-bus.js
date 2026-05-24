class AudioBus {
    constructor(config = {}) {
        const defaults = window.BAContracts?.AudioBusConfig || { master: 0.5, ui: 0.26, action: 0.4, ambient: 0.12 };
        this.config = { ...defaults, ...config };
        this.ctx = null;
        this.ambientTimer = null;
    }

    init() {
        if (this.ctx) return this.ctx;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        this.ctx = new AudioContext();
        return this.ctx;
    }

    arm() {
        const ctx = this.init();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();
    }

    play(channel = "ui", notes = []) {
        const ctx = this.init();
        if (!ctx || ctx.state === "suspended") return;
        const mult = Math.max(0, this.config[channel] || 0.2) * Math.max(0, this.config.master || 0.5);
        notes.forEach(note => this.tone(note.f, note.d, (note.g || 0.01) * mult, note.t || "sine", note.w || 0));
    }

    tone(freq, duration, gainValue, type = "sine", wait = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + wait;
        osc.type = type;
        osc.frequency.setValueAtTime(freq + (Math.random() * 8 - 4), start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
    }

    startAmbient() {
        if (this.ambientTimer || !this.ctx) return;
        const loop = () => {
            if (!this.ctx || document.hidden) {
                this.ambientTimer = setTimeout(loop, 5000);
                return;
            }
            const roots = [220, 247, 294, 330];
            const r = roots[Math.floor(Math.random() * roots.length)];
            this.play("ambient", [{ f: r, d: 1.1, g: 0.015, t: "sine" }, { f: r * 1.5, d: 0.9, g: 0.011, t: "triangle", w: 0.2 }]);
            this.ambientTimer = setTimeout(loop, 5200 + Math.random() * 2800);
        };
        loop();
    }
}

window.BAAudioBus = AudioBus;
