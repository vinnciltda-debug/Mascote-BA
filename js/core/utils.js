const Utils = {
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    loadData(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : this.clone(fallback);
        } catch (error) {
            return this.clone(fallback);
        }
    },

    clone(value) {
        if (typeof structuredClone === "function") return structuredClone(value);
        return JSON.parse(JSON.stringify(value));
    },

    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn("Nao foi possivel salvar o progresso.");
        }
    },

    showToast(message) {
        if (window.UIState?.pushToast) {
            const id = window.UIState.pushToast(message, "info", 2200);
            const previous = document.querySelector(".message-toast");
            if (previous) previous.remove();
            const toast = document.createElement("div");
            toast.className = "message-toast";
            toast.textContent = message;
            document.getElementById("app").appendChild(toast);
            setTimeout(() => {
                toast.remove();
                window.UIState.removeToast?.(id);
            }, 2300);
            return;
        }
        const fallback = document.querySelector(".message-toast");
        if (fallback) fallback.remove();
        const toast = document.createElement("div");
        toast.className = "message-toast";
        toast.textContent = message;
        document.getElementById("app").appendChild(toast);
        setTimeout(() => toast.remove(), 2300);
    },

    animate(el, from, to, options = {}) {
        if (!el || !el.animate) {
            if (options.onFinish) options.onFinish();
            return;
        }
        Object.assign(el.style, from);
        const animation = el.animate([from, to], {
            duration: options.duration || 220,
            easing: options.easing || "ease",
            fill: "forwards"
        });
        animation.onfinish = () => {
            Object.assign(el.style, to);
            if (options.onFinish) options.onFinish();
        };
    },

    audio: {
        ctx: null,
        ambientTimer: null,
        enabled: true,
        bus: null,

        init() {
            if (!this.enabled) return null;
            if (!this.bus && window.BAAudioBus) this.bus = new window.BAAudioBus();
            if (this.bus) {
                this.bus.arm();
                this.ctx = this.bus.ctx || this.ctx;
                return this.ctx;
            }
            if (this.ctx) return this.ctx;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            this.ctx = new AudioContext();
            return this.ctx;
        },

        arm() {
            const ctx = this.init();
            if (!ctx) return;
            if (ctx.state === "suspended") ctx.resume();
            this.startAmbient();
        },

        play(type = "tap") {
            const ctx = this.init();
            if (!ctx || ctx.state === "suspended") return;
            const patterns = {
                tap: [{ f: 520, d: .045, g: .018, t: "triangle" }],
                open: [{ f: 392, d: .05, g: .018, t: "sine" }, { f: 587, d: .07, g: .016, t: "sine", w: .045 }],
                buy: [{ f: 494, d: .06, g: .02, t: "triangle" }, { f: 659, d: .08, g: .018, t: "triangle", w: .055 }],
                equip: [{ f: 330, d: .055, g: .018, t: "sine" }, { f: 440, d: .075, g: .016, t: "sine", w: .055 }],
                success: [{ f: 660, d: .05, g: .016, t: "triangle" }, { f: 880, d: .06, g: .014, t: "triangle", w: .05 }],
                miss: [{ f: 190, d: .08, g: .014, t: "sawtooth" }],
                reward: [{ f: 523, d: .07, g: .018, t: "sine" }, { f: 659, d: .075, g: .017, t: "sine", w: .06 }, { f: 784, d: .09, g: .015, t: "sine", w: .13 }],
                sleep: [{ f: 392, d: .12, g: .013, t: "sine" }, { f: 294, d: .16, g: .011, t: "sine", w: .1 }],
                wake: [{ f: 440, d: .06, g: .014, t: "sine" }, { f: 660, d: .08, g: .014, t: "sine", w: .06 }]
            };
            if (this.bus) {
                const channel = (type === "buy" || type === "equip" || type === "success" || type === "reward") ? "action" : "ui";
                this.bus.play(channel, patterns[type] || patterns.tap);
                return;
            }
            (patterns[type] || patterns.tap).forEach(note => this.tone(note.f, note.d, note.g, note.t, note.w || 0));
        },

        tone(frequency, duration, gainValue, type = "sine", wait = 0) {
            const ctx = this.ctx;
            const start = ctx.currentTime + wait;
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, start);
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(gainValue, start + .015);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.start(start);
            oscillator.stop(start + duration + .02);
        },

        startAmbient() {
            if (this.bus) {
                this.bus.startAmbient();
                return;
            }
            if (this.ambientTimer || !this.ctx) return;
            const notes = [220, 247, 294, 330, 392, 440];
            const loop = () => {
                if (!this.ctx || document.hidden) {
                    this.ambientTimer = setTimeout(loop, 5000);
                    return;
                }
                const root = notes[Math.floor(Math.random() * notes.length)];
                this.tone(root, 1.4, .006, "sine", 0);
                this.tone(root * 1.5, 1.1, .004, "triangle", .22);
                this.ambientTimer = setTimeout(loop, 5200 + Math.random() * 5200);
            };
            loop();
        }
    },

    icon(name, options = {}) {
        const registryMarkup = window.BAIconRegistry?.render?.(name, options);
        if (registryMarkup) return registryMarkup;
        const color = options.color || "currentColor";
        const accent = options.accent || "var(--honey)";
        const icons = {
            coin: `<circle cx="12" cy="12" r="8" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M9 10h5a2 2 0 0 1 0 4H10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            shop: `<path d="M5 10h14l-1-5H6l-1 5Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M6 10v9h12v-9M10 19v-5h4v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
            closet: `<path d="M7 4h10v16H7z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 4v16M10 12h1M14 12h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            sleep: `<path d="M16 4a7 7 0 1 0 4 12 8 8 0 1 1-4-12Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M6 6h5l-5 5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
            wake: `<circle cx="12" cy="12" r="5" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.5 4.5 6 6M18 18l1.5 1.5M19.5 4.5 18 6M6 18l-1.5 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            canteen: `<path d="M8 4v8a3 3 0 0 1-3 3V4M8 15v5M16 4v16M16 4c3 2 4 6 0 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            bath: `<path d="M6 10h12v4a6 6 0 0 1-12 0v-4Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a3 3 0 0 1 6 0M5 20h14M8 4l1-1M12 3l1-1M16 4l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            care: `<path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 9v6M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            game: `<rect x="4" y="8" width="16" height="10" rx="4" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 13h4M10 11v4M16 12h.01M18 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            ball: `<circle cx="12" cy="12" r="8" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" fill="none" stroke="currentColor" stroke-width="2"/>`,
            nectar: `<path d="M9 3h6v4l3 5v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7l3-5V3Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 14h8" stroke="currentColor" stroke-width="2"/>`,
            cookie: `<circle cx="12" cy="12" r="8" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="1.2"/><circle cx="14" cy="11" r="1.2"/><circle cx="11" cy="15" r="1.2"/>`,
            stillLife: `<path d="M5 18h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="13" r="4" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M13 10c2-4 5-3 5-3-1 3-3 4-5 3Z" fill="var(--verdigris)" stroke="currentColor" stroke-width="2"/>`,
            sandwich: `<path d="M5 10c2-5 12-5 14 0v8H5v-8Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M5 14h14" stroke="currentColor" stroke-width="2"/>`,
            soap: `<rect x="5" y="9" width="14" height="9" rx="4" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="4" r="1.5" fill="none" stroke="currentColor" stroke-width="2"/>`,
            tonic: `<path d="M9 3h6v4l3 4v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8l3-4V3Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M10 14h4M12 12v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            color: `<circle cx="12" cy="12" r="8" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2" opacity=".35"/>`,
            stripes: `<rect x="5" y="5" width="14" height="14" rx="4" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 7v10M12 5v14M16 7v10" stroke="currentColor" stroke-width="2"/>`,
            wings: `<path d="M11 12C5 4 1 13 8 16c-2 3 4 5 7-1M13 12c6-8 10 1 3 4 2 3-4 5-7-1" fill="${accent}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
            eyes: `<ellipse cx="8" cy="12" rx="4" ry="5" fill="${accent}" stroke="currentColor" stroke-width="2"/><ellipse cx="16" cy="12" rx="4" ry="5" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>`,
            mouth: `<path d="M7 10c2 5 8 5 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 15h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".35"/>`,
            beret: `<path d="M5 11c4-7 11-7 14 0-4 2-10 2-14 0Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 5c2-2 4-1 5 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            glasses: `<circle cx="8" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12h0" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
            apron: `<path d="M8 5h8l2 15H6L8 5Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M9 9h6M10 15h4" stroke="currentColor" stroke-width="2"/>`,
            brush: `<path d="M14 4l6 6-8 8-6-6 8-8Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M4 20l5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
            chisel: `<path d="M14 3l6 6-4 4-6-6 4-4Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M4 19l8-8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
            frame: `<rect x="5" y="5" width="14" height="14" rx="2" fill="${accent}" stroke="currentColor" stroke-width="2"/><rect x="8" y="8" width="8" height="8" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>`,
            gallery: `<path d="M4 19h16M6 19V6h12v13" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="8" width="3" height="5" fill="${accent}"/><rect x="13" y="8" width="3" height="5" fill="var(--cobalt)"/>`,
            print: `<rect x="5" y="5" width="14" height="14" rx="2" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 12h8M8 15h8" stroke="currentColor" stroke-width="2"/>`,
            mural: `<rect x="5" y="5" width="14" height="14" rx="2" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M5 13h14M12 5v14" stroke="currentColor" stroke-width="2"/><path d="M5 13 12 5" stroke="currentColor" stroke-width="2"/>`,
            sparkle: `<path d="M12 3l2.2 6 6 2.2-6 2.2-2.2 6-2.2-6-6-2.2 6-2.2L12 3Z" fill="${accent}" stroke="currentColor" stroke-width="2"/>`,
            palette: `<path d="M12 4a8 8 0 0 0 0 16h2a2 2 0 0 0 1-3.7 2 2 0 0 1 1-3.7h1A4 4 0 0 0 20 9c0-3-3.5-5-8-5Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="9" r="1"/><circle cx="13" cy="8" r="1"/><circle cx="8" cy="13" r="1"/>`,
            badge: `<rect x="7" y="4" width="10" height="16" rx="2" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2" fill="var(--paper)" stroke="currentColor" stroke-width="2"/><path d="M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            cap: `<path d="M4 9l8-4 8 4-8 4-8-4Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M7 11v4c3 2 7 2 10 0v-4M19 10v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            newspaper: `<path d="M5 5h12a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V5Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 9h5M8 12h8M8 15h7M15 8h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            microphone: `<rect x="9" y="4" width="6" height="10" rx="3" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            camera: `<path d="M5 8h4l1.5-2h3L15 8h4v10H5V8Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="3" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>`,
            megaphone: `<path d="M5 14h3l9 4V6L8 10H5v4Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 14l2 5M18 9l2-2M18 15l2 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            chart: `<path d="M5 19V5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15l3-4 3 2 5-7" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
            calculator: `<rect x="6" y="4" width="12" height="16" rx="2" fill="${accent}" stroke="currentColor" stroke-width="2"/><rect x="8" y="7" width="8" height="3" fill="var(--paper)" stroke="currentColor" stroke-width="1.4"/><path d="M9 13h.01M12 13h.01M15 13h.01M9 16h.01M12 16h.01M15 16h.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`,
            laptop: `<path d="M6 6h12v9H6V6Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M4 18h16l-2-3H6l-2 3Z" fill="var(--paper)" stroke="currentColor" stroke-width="2"/>`,
            poster: `<rect x="6" y="4" width="12" height="16" rx="2" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M8 8h8M8 12h5M8 16h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            ruler: `<path d="M4 15 15 4l5 5L9 20 4 15Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M12 7l2 2M9 10l2 2M6 13l2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
            target: `<circle cx="12" cy="12" r="8" fill="${accent}" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="var(--paper)" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,
            uniform: `<path d="M8 5h8l3 5-3 2v8H8v-8l-3-2 3-5Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M10 7l2 3 2-3M12 10v10" fill="none" stroke="currentColor" stroke-width="2"/>`,
            vest: `<path d="M7 4h4l1 5 1-5h4l2 16H5L7 4Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M9 13h6M12 9v11" stroke="currentColor" stroke-width="2"/>`,
            blazer: `<path d="M7 5h4l1 4 1-4h4l2 15H5L7 5Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M10 6l2 5 2-5M12 11v9" fill="none" stroke="currentColor" stroke-width="2"/>`,
            hoodie: `<path d="M8 9c1-5 7-5 8 0l3 11H5L8 9Z" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M9 10c1 3 5 3 6 0M8 16h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
            question: `<circle cx="12" cy="12" r="8" fill="${accent}" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
        };
        const body = (icons[name] || icons.question)
            .replaceAll('stroke-width="2"', 'stroke-width="1.45"')
            .replaceAll('stroke-width="3"', 'stroke-width="2"')
            .replaceAll('stroke-width="4"', 'stroke-width="2.25"');
        return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="color:${color}">${body}</svg>`;
    }
};

window.Utils = Utils;
