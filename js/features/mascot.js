class Mascot {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.lookX = 0;
        this.isBlinking = false;
        State.subscribe(() => this.render());
        this.startIdleAnimation();
        this.render();
    }

    startIdleAnimation() {
        this.blinkTimer = setInterval(() => {
            this.isBlinking = true;
            this.render();
            setTimeout(() => {
                this.isBlinking = false;
                this.render();
            }, 140);
        }, 2600 + Math.random() * 2800);

        this.lookTimer = setInterval(() => {
            const options = [-8, -4, 0, 4, 8];
            this.lookX = options[Math.floor(Math.random() * options.length)];
            this.render();
        }, 1800 + Math.random() * 2400);
    }

    palette(itemId, fallback) {
        const item = SHOP_ITEMS.find(entry => entry.id === itemId);
        return item && item.color ? item.color : fallback;
    }

    bodyShadow(itemId) {
        const shadows = {
            rose_body: "#c85d72",
            lapis_body: "#2e83ac",
            charcoal_body: "#1e1a17",
            carmim_body: "#b73142",
            verdigris_body: "#2f8062",
            violet_body: "#4f3f8f",
            mint_body: "#45a889",
            cream_body: "#d6bd8e",
            navy_body: "#151b3b",
            lime_body: "#85a82e"
        };
        return shadows[itemId] || "#d58b24";
    }

    itemById(itemId) {
        return SHOP_ITEMS.find(entry => entry.id === itemId) || null;
    }

    hexToRgb(hex) {
        if (!hex || typeof hex !== "string") return null;
        const value = hex.trim();
        if (!value.startsWith("#")) return null;
        const raw = value.slice(1);
        const normalized = raw.length === 3 ? raw.split("").map(part => part + part).join("") : raw;
        if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
        return {
            r: parseInt(normalized.slice(0, 2), 16),
            g: parseInt(normalized.slice(2, 4), 16),
            b: parseInt(normalized.slice(4, 6), 16)
        };
    }

    toHex({ r, g, b }) {
        const part = value => value.toString(16).padStart(2, "0");
        return `#${part(r)}${part(g)}${part(b)}`;
    }

    shiftColor(hex, amount) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        const shift = value => Utils.clamp(Math.round(value + amount), 0, 255);
        return this.toHex({ r: shift(rgb.r), g: shift(rgb.g), b: shift(rgb.b) });
    }

    luminance(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return 0.5;
        const linear = channel => {
            const v = channel / 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * linear(rgb.r) + 0.7152 * linear(rgb.g) + 0.0722 * linear(rgb.b);
    }

    detailInk(bodyColor) {
        const lum = this.luminance(bodyColor);
        if (lum < 0.2) return "#f7f2e8";
        if (lum < 0.33) return "#efe6d2";
        return "#25201b";
    }

    itemAccent(item, fallback = "#f4c434") {
        if (item?.color) return item.color;
        const accentByIcon = {
            newspaper: "#2167a8",
            chart: "#2f8f63",
            target: "#df4d5c",
            microphone: "#58b7d8",
            camera: "#4f3f8f",
            ruler: "#7256a6",
            laptop: "#2167a8",
            poster: "#df4d5c",
            cap: "#34302b",
            badge: "#df4d5c",
            palette: "#b6753a",
            sparkle: "#f6d65b",
            vest: "#2167a8",
            blazer: "#2f8f63",
            hoodie: "#7256a6"
        };
        return accentByIcon[item?.icon] || fallback;
    }

    itemLabel(item) {
        const source = (item?.name || "?").replace(/[^A-Za-z0-9]/g, "");
        return source.slice(0, 2).toUpperCase() || "?";
    }

    render() {
        const state = State.state;
        const eq = state.equipped;
        const body = this.palette(eq.bodyColor, "#f4c434");
        const bodyDeep = this.bodyShadow(eq.bodyColor);
        const stripes = this.palette(eq.stripeColor, "#8b5831");
        const wings = this.palette(eq.wingColor, "#b9eff6");
        const detailInk = this.detailInk(body);
        const sad = !state.isSleeping && (
            state.stats.hunger < 24 ||
            state.stats.health < 26 ||
            state.stats.fun < 22 ||
            state.stats.energy < 20 ||
            state.stats.clean < 22
        );
        const shouldBlink = this.isBlinking && !state.isSleeping;

        this.container.innerHTML = `
            <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                    <filter id="paperNoise">
                        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/>
                        <feColorMatrix type="saturate" values=".18"/>
                        <feBlend mode="multiply" in2="SourceGraphic"/>
                    </filter>
                    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="${body}"/>
                        <stop offset="1" stop-color="${bodyDeep}"/>
                    </linearGradient>
                </defs>

                ${this.renderAura(eq.aura)}

                <g class="wings" opacity="${state.isSleeping ? ".32" : ".92"}">
                    <path d="M143 164 C58 92 32 215 119 240 C79 280 156 311 184 235" fill="${wings}" stroke="#25201b" stroke-width="9" stroke-linejoin="round"/>
                    <path d="M277 164 C362 92 388 215 301 240 C341 280 264 311 236 235" fill="${wings}" stroke="#25201b" stroke-width="9" stroke-linejoin="round"/>
                    <path d="M86 196 C112 200 142 211 165 230" fill="none" stroke="#25201b" stroke-width="4" opacity=".24"/>
                    <path d="M334 196 C308 200 278 211 255 230" fill="none" stroke="#25201b" stroke-width="4" opacity=".24"/>
                </g>

                <g class="antenna" fill="none" stroke="#25201b" stroke-width="9" stroke-linecap="round">
                    <path d="M169 105 C139 62 111 53 92 70"/>
                    <path d="M251 105 C281 62 309 53 328 70"/>
                    <circle cx="87" cy="72" r="13" fill="#f4c434"/>
                    <circle cx="333" cy="72" r="13" fill="#f4c434"/>
                </g>
                ${this.renderAntennaStyle(eq.antenna)}

                <path d="M210 83 C289 83 336 174 333 248 C330 331 280 370 210 370 C140 370 90 331 87 248 C84 174 131 83 210 83 Z" fill="url(#bodyGrad)" stroke="#25201b" stroke-width="12"/>
                <path d="M112 258 C155 278 265 278 308 258" fill="none" stroke="${stripes}" stroke-width="22" stroke-linecap="round" opacity=".74"/>
                <path d="M129 308 C170 326 250 326 291 308" fill="none" stroke="${stripes}" stroke-width="18" stroke-linecap="round" opacity=".64"/>
                ${this.renderMarkings(eq.marking, detailInk)}

                ${this.renderEyes(eq.eyes, state.isSleeping || shouldBlink, this.lookX)}
                ${this.renderCheeks(eq.cheeks)}
                ${this.renderMouth(eq.mouth, sad, state.isSleeping, detailInk)}
                ${this.renderAccessories(eq, detailInk)}
                ${this.renderBadge(eq.badge)}

                <path d="M124 132 C159 102 259 102 296 132" fill="none" stroke="#fff6c9" stroke-width="13" stroke-linecap="round" opacity=".26"/>
            </svg>
        `;
    }

    renderAura(aura) {
        if (!aura || aura === "no_aura") return "";
        if (aura === "spark_aura") {
            return `
                <g opacity=".75" fill="#f6d65b" stroke="#25201b" stroke-width="3">
                    <path d="M93 122l8 18 19 3-14 13 4 19-17-10-17 10 4-19-14-13 19-3 8-18Z"/>
                    <path d="M331 132l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2 6-14Z"/>
                    <path d="M76 291l5 12 13 2-9 9 2 13-11-7-11 7 2-13-9-9 13-2 5-12Z"/>
                </g>
            `;
        }
        if (aura === "briefing_aura") {
            return `
                <g opacity=".72" stroke="#25201b" stroke-width="4">
                    <rect x="52" y="142" width="54" height="38" rx="7" fill="#df4d5c" transform="rotate(-9 79 161)"/>
                    <rect x="318" y="126" width="50" height="36" rx="7" fill="#f4c434" transform="rotate(8 343 144)"/>
                    <rect x="318" y="292" width="54" height="38" rx="7" fill="#2167a8" transform="rotate(-7 345 311)"/>
                    <path d="M64 157h28M332 140h22M332 304h26" stroke="#fffaf0" stroke-width="5" stroke-linecap="round"/>
                </g>
            `;
        }
        if (aura === "news_aura") {
            return `
                <g opacity=".64" fill="none" stroke="#25201b" stroke-width="5" stroke-linecap="round">
                    <path d="M56 132h70M48 154h58M306 116h66M316 139h48M58 308h62M74 331h44M296 318h74"/>
                </g>
            `;
        }
        if (aura === "data_aura") {
            return `
                <g opacity=".7" fill="none" stroke="#2f8f63" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M49 289l30-37 28 18 34-52"/>
                    <path d="M288 121l24 28 23-18 34 46"/>
                    <path d="M298 321h72M298 321v-76"/>
                    <rect x="312" y="284" width="10" height="37" fill="#2f8f63" stroke="#25201b" stroke-width="3"/>
                    <rect x="335" y="264" width="10" height="57" fill="#f4c434" stroke="#25201b" stroke-width="3"/>
                    <rect x="358" y="244" width="10" height="77" fill="#2167a8" stroke="#25201b" stroke-width="3"/>
                </g>
            `;
        }
        if (aura === "design_aura") {
            return `
                <g opacity=".48" stroke="#2167a8" stroke-width="3">
                    <path d="M42 105h336M42 155h336M42 205h336M42 255h336M42 305h336"/>
                    <path d="M70 72v284M120 72v284M300 72v284M350 72v284"/>
                </g>
            `;
        }
        if (aura === "pp_aura") {
            return `
                <g opacity=".72" fill="none" stroke="#df4d5c" stroke-width="6">
                    <circle cx="83" cy="150" r="24"/>
                    <circle cx="83" cy="150" r="10" fill="#f4c434"/>
                    <circle cx="334" cy="286" r="30"/>
                    <circle cx="334" cy="286" r="12" fill="#f4c434"/>
                    <path d="M321 95l24 42 24-42M53 332l52-18" stroke-linecap="round"/>
                </g>
            `;
        }
        if (aura) {
            const item = this.itemById(aura);
            const accent = this.itemAccent(item, "#f6d65b");
            const soft = this.shiftColor(accent, 32);
            return `
                <g opacity=".38" fill="none" stroke="${accent}" stroke-width="5">
                    <circle cx="210" cy="228" r="156"/>
                    <circle cx="210" cy="228" r="132" stroke="${soft}" stroke-width="3"/>
                </g>
            `;
        }
        return "";
    }

    renderAntennaStyle(antenna) {
        if (!antenna || antenna === "classic_antenna") return "";
        if (antenna === "neon_antenna") {
            return `
                <g fill="none" stroke-linecap="round">
                    <circle cx="87" cy="72" r="22" stroke="#67e8f9" stroke-width="6" opacity=".78"/>
                    <circle cx="333" cy="72" r="22" stroke="#67e8f9" stroke-width="6" opacity=".78"/>
                    <circle cx="87" cy="72" r="7" fill="#ffffff"/>
                    <circle cx="333" cy="72" r="7" fill="#ffffff"/>
                </g>
            `;
        }
        if (antenna === "press_antenna") {
            return `
                <g stroke="#25201b" stroke-width="4" fill="#fffaf0">
                    <rect x="64" y="49" width="34" height="27" rx="4" transform="rotate(-12 81 62)"/>
                    <rect x="322" y="50" width="34" height="27" rx="4" transform="rotate(12 339 63)"/>
                    <path d="M70 59h18M69 67h20M328 60h18M329 68h18"/>
                </g>
            `;
        }
        if (antenna === "campus_antenna") {
            return `
                <g fill="#df4d5c" stroke="#25201b" stroke-width="4">
                    <circle cx="87" cy="72" r="18"/>
                    <circle cx="333" cy="72" r="18"/>
                    <text x="87" y="79" text-anchor="middle" font-size="18" font-weight="900" fill="#fffaf0" stroke="none">BA</text>
                    <text x="333" y="79" text-anchor="middle" font-size="18" font-weight="900" fill="#fffaf0" stroke="none">BA</text>
                </g>
            `;
        }
        if (antenna === "signal_antenna") {
            return `
                <g fill="none" stroke="#25201b" stroke-width="5" stroke-linecap="round">
                    <path d="M65 48 C48 64 48 82 65 98"/>
                    <path d="M355 48 C372 64 372 82 355 98"/>
                    <path d="M76 58 C67 68 67 78 76 88"/>
                    <path d="M344 58 C353 68 353 78 344 88"/>
                </g>
            `;
        }
        if (antenna === "gold_antenna") {
            return `
                <g fill="#f6d65b" stroke="#25201b" stroke-width="4">
                    <path d="M87 48l7 15 16 2-12 11 4 16-15-9-15 9 4-16-12-11 16-2 7-15Z"/>
                    <path d="M333 48l7 15 16 2-12 11 4 16-15-9-15 9 4-16-12-11 16-2 7-15Z"/>
                </g>
            `;
        }
        if (antenna) {
            const item = this.itemById(antenna);
            const accent = this.itemAccent(item, "#f6d65b");
            return `
                <g fill="${accent}" stroke="#25201b" stroke-width="4">
                    <circle cx="87" cy="72" r="16"/>
                    <circle cx="333" cy="72" r="16"/>
                    <circle cx="87" cy="72" r="5" fill="#fffaf0"/>
                    <circle cx="333" cy="72" r="5" fill="#fffaf0"/>
                </g>
            `;
        }
        return "";
    }

    renderCheeks(cheeks) {
        if (!cheeks || cheeks === "no_cheeks") return "";
        if (cheeks === "rose_cheeks") {
            return `<g opacity=".72" fill="#f08aa0"><ellipse cx="122" cy="219" rx="23" ry="16"/><ellipse cx="298" cy="219" rx="23" ry="16"/></g>`;
        }
        if (cheeks === "paint_splash_cheeks") {
            return `
                <g stroke="#25201b" stroke-width="3">
                    <circle cx="121" cy="219" r="13" fill="#df4d5c"/>
                    <circle cx="137" cy="206" r="7" fill="#2167a8"/>
                    <circle cx="289" cy="220" r="12" fill="#f4c434"/>
                    <circle cx="306" cy="209" r="7" fill="#48a77c"/>
                </g>
            `;
        }
        if (cheeks === "freckle_cheeks") {
            return `
                <g fill="#6b4428">
                    <circle cx="112" cy="213" r="4"/><circle cx="126" cy="224" r="4"/><circle cx="138" cy="212" r="3"/>
                    <circle cx="282" cy="213" r="4"/><circle cx="296" cy="224" r="4"/><circle cx="310" cy="212" r="3"/>
                </g>
            `;
        }
        if (cheeks === "sticker_cheeks") {
            return `
                <g stroke="#25201b" stroke-width="4">
                    <rect x="104" y="205" width="35" height="25" rx="7" fill="#fffaf0" transform="rotate(-8 121 218)"/>
                    <rect x="282" y="205" width="35" height="25" rx="7" fill="#fffaf0" transform="rotate(8 299 218)"/>
                    <text x="121" y="224" text-anchor="middle" font-size="14" font-weight="900" fill="#df4d5c" stroke="none">BA</text>
                    <text x="299" y="224" text-anchor="middle" font-size="14" font-weight="900" fill="#df4d5c" stroke="none">BA</text>
                </g>
            `;
        }
        if (cheeks === "pixel_cheeks") {
            return `
                <g stroke="#25201b" stroke-width="2">
                    <rect x="105" y="209" width="12" height="12" fill="#2167a8"/>
                    <rect x="119" y="222" width="12" height="12" fill="#df4d5c"/>
                    <rect x="133" y="209" width="12" height="12" fill="#f4c434"/>
                    <rect x="276" y="209" width="12" height="12" fill="#2167a8"/>
                    <rect x="290" y="222" width="12" height="12" fill="#df4d5c"/>
                    <rect x="304" y="209" width="12" height="12" fill="#f4c434"/>
                </g>
            `;
        }
        if (cheeks) {
            const item = this.itemById(cheeks);
            const accent = this.itemAccent(item, "#f08aa0");
            return `<g opacity=".65" fill="${accent}"><ellipse cx="122" cy="219" rx="18" ry="12"/><ellipse cx="298" cy="219" rx="18" ry="12"/></g>`;
        }
        return "";
    }

    renderBadge(badge) {
        if (!badge || badge === "no_badge") return "";
        const map = {
            ba_badge: { fill: "#df4d5c", text: "BA" },
            press_badge: { fill: "#2167a8", text: "J" },
            economy_badge: { fill: "#2f8f63", text: "$" },
            design_badge: { fill: "#7256a6", text: "D" },
            pp_badge: { fill: "#f4c434", text: "PP" },
            star_badge: { fill: "#f6d65b", text: "*" }
        };
        const data = map[badge];
        if (!data && badge) {
            const item = this.itemById(badge);
            const accent = this.itemAccent(item, "#df4d5c");
            return `
                <g transform="translate(239 286)">
                    <circle cx="0" cy="0" r="20" fill="${accent}" stroke="#25201b" stroke-width="5"/>
                    <text x="0" y="7" text-anchor="middle" font-size="15" font-weight="900" fill="#fffaf0" stroke="none">${this.itemLabel(item).slice(0, 1)}</text>
                </g>
            `;
        }
        if (!data) return "";
        return `
            <g transform="translate(239 286)">
                <path d="M0 -24 L22 -12 L18 15 L0 28 L-18 15 L-22 -12 Z" fill="${data.fill}" stroke="#25201b" stroke-width="5"/>
                <text x="0" y="7" text-anchor="middle" font-size="${data.text.length > 1 ? 16 : 23}" font-weight="900" fill="#fffaf0" stroke="none">${data.text}</text>
            </g>
        `;
    }

    renderEyes(eyes, closed, lookX = 0) {
        if (closed || eyes === "sleepy_eyes") {
            return `
                <g stroke="#25201b" stroke-width="11" stroke-linecap="round" fill="none">
                    <path d="M138 169 C158 158 178 158 196 169"/>
                    <path d="M224 169 C244 158 264 158 282 169"/>
                </g>
            `;
        }

        if (eyes === "spark_eyes") {
            return `
                <g>
                    <ellipse cx="164" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <ellipse cx="256" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <path d="M164 148l6 15 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2 6-15Z" fill="#25201b"/>
                    <path d="M256 148l6 15 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2 6-15Z" fill="#25201b"/>
                    <circle cx="170" cy="162" r="5" fill="#ffffff"/>
                    <circle cx="262" cy="162" r="5" fill="#ffffff"/>
                </g>
            `;
        }

        if (eyes === "reporter_eyes") {
            return `
                <g>
                    <ellipse cx="164" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <ellipse cx="256" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <circle cx="${158 + lookX}" cy="174" r="20" fill="#25201b"/>
                    <circle cx="${250 + lookX}" cy="174" r="20" fill="#25201b"/>
                    <circle cx="${150 + lookX}" cy="164" r="6" fill="#ffffff"/>
                    <circle cx="${242 + lookX}" cy="164" r="6" fill="#ffffff"/>
                    <path d="M128 127 h70 M222 127 h70" stroke="#25201b" stroke-width="7" stroke-linecap="round"/>
                </g>
            `;
        }

        if (eyes === "planner_eyes") {
            return `
                <g>
                    <ellipse cx="164" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <ellipse cx="256" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <path d="M164 148v47M140 171h48M256 148v47M232 171h48" stroke="#25201b" stroke-width="7" stroke-linecap="round"/>
                    <circle cx="164" cy="171" r="12" fill="none" stroke="#c8464a" stroke-width="6"/>
                    <circle cx="256" cy="171" r="12" fill="none" stroke="#c8464a" stroke-width="6"/>
                </g>
            `;
        }

        if (eyes === "data_eyes") {
            return `
                <g>
                    <ellipse cx="164" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <ellipse cx="256" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                    <path d="M140 181l18-22 17 11 18-28M232 181l18-22 17 11 18-28" fill="none" stroke="#25201b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
            `;
        }

        const pupilOffset = (eyes === "curious_eyes" ? 4 : 0) + lookX;
        return `
            <g>
                <ellipse cx="164" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                <ellipse cx="256" cy="171" rx="40" ry="45" fill="#fffdf7" stroke="#25201b" stroke-width="8"/>
                <circle cx="${164 + pupilOffset}" cy="174" r="22" fill="#25201b"/>
                <circle cx="${256 + pupilOffset}" cy="174" r="22" fill="#25201b"/>
                <circle cx="${173 + pupilOffset}" cy="161" r="7" fill="#ffffff"/>
                <circle cx="${265 + pupilOffset}" cy="161" r="7" fill="#ffffff"/>
            </g>
        `;
    }

    renderMouth(mouth, sad, sleeping, detailInk = "#25201b") {
        if (sleeping) {
            return `<path d="M194 237 C205 246 216 246 227 237" fill="none" stroke="${detailInk}" stroke-width="7" stroke-linecap="round"/>`;
        }
        if (sad) {
            return `<path d="M184 252 C202 234 220 234 238 252" fill="none" stroke="${detailInk}" stroke-width="8" stroke-linecap="round"/>`;
        }
        if (mouth === "proud_smile") {
            return `
                <path d="M175 233 C197 264 231 264 253 233" fill="#fffdf7" stroke="${detailInk}" stroke-width="8" stroke-linecap="round"/>
                <line x1="210" y1="242" x2="210" y2="260" stroke="${detailInk}" stroke-width="4"/>
            `;
        }
        if (mouth === "focus_mouth") {
            return `
                <path d="M188 240 C202 232 218 232 232 240" fill="none" stroke="${detailInk}" stroke-width="8" stroke-linecap="round"/>
                <path d="M195 253 L225 253" stroke="${detailInk}" stroke-width="6" stroke-linecap="round" opacity=".35"/>
            `;
        }
        if (mouth === "pitch_mouth") {
            return `
                <path d="M181 239 C202 260 230 260 251 239" fill="none" stroke="${detailInk}" stroke-width="8" stroke-linecap="round"/>
                <path d="M254 236 C274 229 287 218 296 204" fill="none" stroke="${detailInk}" stroke-width="6" stroke-linecap="round"/>
            `;
        }
        if (mouth === "interview_mouth") {
            return `
                <ellipse cx="211" cy="244" rx="24" ry="16" fill="#fffdf7" stroke="${detailInk}" stroke-width="7"/>
                <path d="M190 240 C205 251 218 251 232 240" fill="none" stroke="#c8464a" stroke-width="5" stroke-linecap="round"/>
            `;
        }
        return `<path d="M184 236 C202 253 222 253 240 236" fill="none" stroke="${detailInk}" stroke-width="8" stroke-linecap="round"/>`;
    }

    renderMarkings(marking, detailInk = "#25201b") {
        if (marking === "poster_marking") {
            return `
                <g opacity=".85" stroke="#25201b" stroke-width="4">
                    <rect x="148" y="274" width="28" height="24" rx="5" fill="#c8464a"/>
                    <circle cx="230" cy="285" r="15" fill="#2167a8"/>
                    <path d="M258 308l25 12-24 14Z" fill="#48a77c"/>
                </g>
            `;
        }
        if (marking === "press_marking") {
            return `
                <g opacity=".72" stroke="${detailInk}" stroke-width="6" stroke-linecap="round">
                    <path d="M150 271h118M141 293h140M157 316h104"/>
                </g>
            `;
        }
        if (marking === "campaign_marking") {
            return `
                <g fill="none" stroke="#25201b" stroke-width="5">
                    <circle cx="210" cy="292" r="28" fill="#fffaf0"/>
                    <circle cx="210" cy="292" r="15" fill="#c8464a"/>
                    <path d="M250 264l26-18M248 318l26 18"/>
                </g>
            `;
        }
        if (marking === "economy_marking") {
            return `
                <path d="M142 316 C171 293 185 303 207 276 C229 249 258 268 282 238" fill="none" stroke="#fffaf0" stroke-width="9" stroke-linecap="round"/>
                <path d="M142 316 C171 293 185 303 207 276 C229 249 258 268 282 238" fill="none" stroke="#25201b" stroke-width="5" stroke-linecap="round"/>
            `;
        }
        if (marking === "design_marking") {
            return `
                <g opacity=".68" stroke="${detailInk === "#25201b" ? "#fffaf0" : detailInk}" stroke-width="4">
                    <path d="M146 258h128M139 284h142M151 310h118"/>
                    <path d="M170 244v89M210 239v102M250 248v84"/>
                </g>
            `;
        }
        if (marking && marking !== "classic_marking") {
            return `
                <g opacity=".52" stroke="${detailInk}" stroke-width="4" stroke-linecap="round">
                    <path d="M150 266 C174 252 246 252 270 266"/>
                    <path d="M143 289 C176 304 244 304 277 289"/>
                    <path d="M155 314 C182 330 238 330 265 314"/>
                </g>
            `;
        }
        return "";
    }

    renderAccessories(eq, detailInk = "#25201b") {
        let svg = "";
        const knownHats = new Set(["beret", "halo_hat", "press_cap", "graduation_cap", "agency_headset", "visor_hat", "paint_crown", "planner_pin"]);
        const knownGlasses = new Set(["critique_glasses", "round_glasses", "data_glasses", "design_specs"]);
        const knownOutfits = new Set(["apron", "museum_cape", "ba_uniform", "journalism_vest", "economy_blazer", "design_smock", "pp_blazer", "agency_hoodie", "radio_jacket", "startup_tee", "photo_vest", "campus_cardigan"]);
        const knownProps = new Set(["brush_prop", "chisel_prop", "palette_prop", "mic_prop", "camera_prop", "megaphone_prop", "chart_prop", "laptop_prop", "tablet_prop", "poster_prop", "notebook_prop", "coffee_prop", "pencil_prop"]);
        if (eq.hat === "beret") {
            svg += `
                <path d="M121 95 C173 45 258 45 303 95 C259 113 166 113 121 95 Z" fill="#4f3f8f" stroke="#25201b" stroke-width="8"/>
                <path d="M211 51 C233 35 252 39 260 51" fill="none" stroke="#25201b" stroke-width="7" stroke-linecap="round"/>
            `;
        }
        if (eq.hat === "halo_hat") {
            svg += `
                <ellipse cx="210" cy="68" rx="72" ry="18" fill="none" stroke="#f6d65b" stroke-width="10"/>
                <ellipse cx="210" cy="68" rx="72" ry="18" fill="none" stroke="#25201b" stroke-width="4" opacity=".55"/>
            `;
        }
        if (eq.hat === "press_cap") {
            svg += `
                <path d="M132 94 C170 58 254 58 292 94 L275 120 C237 104 184 104 145 120 Z" fill="#2167a8" stroke="#25201b" stroke-width="8"/>
                <path d="M162 92 C190 76 232 76 260 92" fill="none" stroke="#fffaf0" stroke-width="7" stroke-linecap="round"/>
                <rect x="188" y="91" width="44" height="22" rx="6" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
            `;
        }
        if (eq.hat === "graduation_cap") {
            svg += `
                <path d="M114 86 L210 45 L306 86 L210 127 Z" fill="#34302b" stroke="#25201b" stroke-width="8"/>
                <path d="M160 106 C190 125 230 125 260 106 L250 140 C224 154 196 154 170 140 Z" fill="#34302b" stroke="#25201b" stroke-width="7"/>
                <path d="M278 88 V134" stroke="#f4c434" stroke-width="7" stroke-linecap="round"/>
                <circle cx="278" cy="142" r="8" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
            `;
        }
        if (eq.hat === "agency_headset") {
            svg += `
                <path d="M129 139 C135 72 285 72 291 139" fill="none" stroke="#25201b" stroke-width="9" stroke-linecap="round"/>
                <rect x="112" y="136" width="32" height="54" rx="14" fill="#7256a6" stroke="#25201b" stroke-width="7"/>
                <rect x="276" y="136" width="32" height="54" rx="14" fill="#7256a6" stroke="#25201b" stroke-width="7"/>
                <path d="M292 184 C286 216 259 225 239 224" fill="none" stroke="#25201b" stroke-width="6" stroke-linecap="round"/>
            `;
        }
        if (eq.hat === "visor_hat") {
            svg += `
                <path d="M125 91 C165 67 254 67 295 91 L279 113 C239 102 181 102 141 113 Z" fill="#f4c434" stroke="#25201b" stroke-width="8"/>
                <path d="M140 104 C177 126 254 126 292 104 L316 119 C262 142 160 142 106 119 Z" fill="#67e8f9" stroke="#25201b" stroke-width="7"/>
            `;
        }
        if (eq.hat === "paint_crown") {
            svg += `
                <g stroke="#25201b" stroke-width="6">
                    <path d="M139 100 L162 65 L190 100 L213 57 L239 100 L269 67 L291 100 Z" fill="#f4c434"/>
                    <circle cx="162" cy="65" r="8" fill="#df4d5c"/>
                    <circle cx="213" cy="57" r="8" fill="#2167a8"/>
                    <circle cx="269" cy="67" r="8" fill="#48a77c"/>
                </g>
            `;
        }
        if (eq.hat === "planner_pin") {
            svg += `
                <g transform="rotate(-8 252 104)" stroke="#25201b" stroke-width="5">
                    <rect x="228" y="77" width="62" height="42" rx="10" fill="#fffaf0"/>
                    <circle cx="259" cy="98" r="13" fill="none"/>
                    <path d="M259 84v28M245 98h28" stroke="#df4d5c" stroke-width="5" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.glasses === "critique_glasses") {
            svg += `
                <g fill="none" stroke="#25201b" stroke-width="7">
                    <rect x="121" y="135" width="76" height="62" rx="22"/>
                    <rect x="223" y="135" width="76" height="62" rx="22"/>
                    <path d="M197 166 L223 166"/>
                </g>
            `;
        }
        if (eq.glasses === "round_glasses") {
            svg += `
                <g fill="rgba(255,250,240,.16)" stroke="#25201b" stroke-width="7">
                    <circle cx="160" cy="166" r="36"/>
                    <circle cx="260" cy="166" r="36"/>
                    <path d="M196 166 L224 166" fill="none"/>
                </g>
            `;
        }
        if (eq.glasses === "data_glasses") {
            svg += `
                <g fill="rgba(185,239,246,.22)" stroke="#25201b" stroke-width="7">
                    <rect x="119" y="137" width="82" height="60" rx="12"/>
                    <rect x="219" y="137" width="82" height="60" rx="12"/>
                    <path d="M201 166 L219 166" fill="none"/>
                    <path d="M132 181l18-20 18 10 20-24M232 181l18-20 18 10 20-24" fill="none" stroke="#48a77c" stroke-width="5"/>
                </g>
            `;
        }
        if (eq.glasses === "design_specs") {
            svg += `
                <g fill="rgba(255,255,255,.18)" stroke="#25201b" stroke-width="7">
                    <path d="M122 139 h76 v58 h-76 zM222 139 h76 v58 h-76 zM198 166h24" />
                    <path d="M139 151h42M139 166h42M139 181h42M239 151h42M239 166h42M239 181h42" stroke="#2167a8" stroke-width="3"/>
                </g>
            `;
        }
        if (eq.outfit === "apron") {
            svg += `
                <path d="M151 254 C170 238 250 238 269 254 L284 342 C245 365 176 365 137 342 Z" fill="#fff4df" stroke="#25201b" stroke-width="7"/>
                <circle cx="183" cy="302" r="9" fill="#c8464a"/>
                <circle cx="228" cy="326" r="8" fill="#2167a8"/>
                <path d="M161 276 L257 276" stroke="#25201b" stroke-width="5"/>
            `;
        }
        if (eq.outfit === "museum_cape") {
            svg += `
                <path d="M123 243 C154 269 266 269 297 243 L316 348 C263 382 157 382 104 348 Z" fill="#4f3f8f" stroke="#25201b" stroke-width="8"/>
                <path d="M151 264 C178 280 242 280 269 264" fill="none" stroke="#f6d65b" stroke-width="8" stroke-linecap="round"/>
            `;
        }
        if (eq.outfit === "ba_uniform") {
            svg += `
                <path d="M144 255 C168 239 252 239 276 255 L289 344 C249 366 171 366 131 344 Z" fill="#fffaf0" stroke="#25201b" stroke-width="7"/>
                <path d="M170 259 L210 306 L250 259" fill="#f4c434" stroke="#25201b" stroke-width="6"/>
                <rect x="191" y="306" width="38" height="28" rx="7" fill="#2167a8" stroke="#25201b" stroke-width="5"/>
            `;
        }
        if (eq.outfit === "journalism_vest") {
            svg += `
                <path d="M142 252 C170 238 250 238 278 252 L294 344 C247 366 173 366 126 344 Z" fill="#2167a8" stroke="#25201b" stroke-width="7"/>
                <path d="M183 253 L210 336 L237 253" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                <rect x="151" y="300" width="48" height="24" rx="5" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
            `;
        }
        if (eq.outfit === "economy_blazer") {
            svg += `
                <path d="M137 254 C166 237 254 237 283 254 L302 345 C252 369 168 369 118 345 Z" fill="#2f8f63" stroke="#25201b" stroke-width="7"/>
                <path d="M183 252 L210 306 L237 252" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                <path d="M166 324l25-30 22 14 35-45" fill="none" stroke="#f4c434" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        }
        if (eq.outfit === "design_smock") {
            svg += `
                <path d="M145 254 C170 238 250 238 275 254 L289 344 C247 366 173 366 131 344 Z" fill="#e9fbff" stroke="#25201b" stroke-width="7"/>
                <path d="M158 282h103M158 307h103M184 260v88M222 260v88" stroke="#2167a8" stroke-width="4" opacity=".75"/>
                <circle cx="183" cy="309" r="10" fill="#c8464a"/>
            `;
        }
        if (eq.outfit === "pp_blazer") {
            svg += `
                <path d="M137 254 C166 237 254 237 283 254 L302 345 C252 369 168 369 118 345 Z" fill="#df4d5c" stroke="#25201b" stroke-width="7"/>
                <path d="M183 252 L210 312 L237 252" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                <path d="M210 274 L229 324 L191 324 Z" fill="#f4c434" stroke="#25201b" stroke-width="5"/>
            `;
        }
        if (eq.outfit === "agency_hoodie") {
            svg += `
                <path d="M142 260 C156 220 264 220 278 260 L294 345 C247 370 173 370 126 345 Z" fill="#7256a6" stroke="#25201b" stroke-width="7"/>
                <path d="M174 263 C188 282 232 282 246 263" fill="none" stroke="#fffaf0" stroke-width="7" stroke-linecap="round"/>
                <text x="210" y="326" text-anchor="middle" font-size="42" font-weight="900" fill="#f4c434" stroke="#25201b" stroke-width="2">PP</text>
            `;
        }
        if (eq.outfit === "radio_jacket") {
            svg += `
                <path d="M137 254 C166 237 254 237 283 254 L302 345 C252 369 168 369 118 345 Z" fill="#27335f" stroke="#25201b" stroke-width="7"/>
                <path d="M175 256 L210 320 L245 256" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                <path d="M164 315 C190 296 230 296 256 315" fill="none" stroke="#67e8f9" stroke-width="7" stroke-linecap="round"/>
                <circle cx="184" cy="300" r="8" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
                <circle cx="236" cy="300" r="8" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
            `;
        }
        if (eq.outfit === "startup_tee") {
            svg += `
                <path d="M145 258 C170 240 250 240 275 258 L288 344 C247 366 173 366 132 344 Z" fill="#e9fbff" stroke="#25201b" stroke-width="7"/>
                <rect x="176" y="286" width="68" height="45" rx="9" fill="#2167a8" stroke="#25201b" stroke-width="5"/>
                <path d="M188 310h44M198 298h24" stroke="#fffaf0" stroke-width="5" stroke-linecap="round"/>
            `;
        }
        if (eq.outfit === "photo_vest") {
            svg += `
                <path d="M142 252 C170 238 250 238 278 252 L294 344 C247 366 173 366 126 344 Z" fill="#34302b" stroke="#25201b" stroke-width="7"/>
                <path d="M185 253 L210 336 L235 253" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                <rect x="150" y="296" width="45" height="28" rx="5" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
                <circle cx="250" cy="310" r="16" fill="#58b7d8" stroke="#25201b" stroke-width="5"/>
            `;
        }
        if (eq.outfit === "campus_cardigan") {
            svg += `
                <path d="M139 256 C166 239 254 239 281 256 L298 345 C250 369 170 369 122 345 Z" fill="#7bd8bc" stroke="#25201b" stroke-width="7"/>
                <path d="M181 254 L210 314 L239 254" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                <circle cx="210" cy="299" r="6" fill="#df4d5c"/>
                <circle cx="210" cy="322" r="6" fill="#df4d5c"/>
            `;
        }
        if (eq.prop === "brush_prop") {
            svg += `
                <g transform="rotate(-28 305 286)">
                    <rect x="297" y="214" width="15" height="104" rx="7" fill="#8b5831" stroke="#25201b" stroke-width="5"/>
                    <path d="M292 205 C302 185 319 185 323 207 L314 225 L297 225 Z" fill="#c8464a" stroke="#25201b" stroke-width="5"/>
                </g>
            `;
        }
        if (eq.prop === "chisel_prop") {
            svg += `
                <g transform="rotate(-25 306 286)">
                    <rect x="298" y="217" width="17" height="96" rx="6" fill="#7d5632" stroke="#25201b" stroke-width="5"/>
                    <path d="M295 198 L319 198 L313 225 L301 225 Z" fill="#c9d1d3" stroke="#25201b" stroke-width="5"/>
                </g>
            `;
        }
        if (eq.prop === "palette_prop") {
            svg += `
                <g transform="rotate(16 304 294)">
                    <path d="M290 246 C333 236 363 261 349 294 C341 312 322 302 319 318 C316 337 277 323 276 291 C275 268 278 252 290 246 Z" fill="#b6753a" stroke="#25201b" stroke-width="6"/>
                    <circle cx="302" cy="268" r="7" fill="#f4c434" stroke="#25201b" stroke-width="3"/>
                    <circle cx="326" cy="270" r="7" fill="#c8464a" stroke="#25201b" stroke-width="3"/>
                    <circle cx="310" cy="296" r="7" fill="#2167a8" stroke="#25201b" stroke-width="3"/>
                    <circle cx="336" cy="292" r="7" fill="#48a77c" stroke="#25201b" stroke-width="3"/>
                </g>
            `;
        }
        if (eq.prop === "mic_prop") {
            svg += `
                <g transform="rotate(-22 306 289)">
                    <rect x="300" y="218" width="18" height="88" rx="8" fill="#34302b" stroke="#25201b" stroke-width="5"/>
                    <ellipse cx="309" cy="205" rx="18" ry="23" fill="#2167a8" stroke="#25201b" stroke-width="5"/>
                    <path d="M296 204h26M297 214h24" stroke="#fffaf0" stroke-width="4" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "camera_prop") {
            svg += `
                <g transform="rotate(12 312 292)">
                    <rect x="279" y="252" width="70" height="50" rx="10" fill="#34302b" stroke="#25201b" stroke-width="6"/>
                    <circle cx="314" cy="277" r="16" fill="#58b7d8" stroke="#fffaf0" stroke-width="5"/>
                    <rect x="292" y="239" width="27" height="15" rx="5" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
                </g>
            `;
        }
        if (eq.prop === "megaphone_prop") {
            svg += `
                <g transform="rotate(-18 310 287)">
                    <path d="M289 267 L350 238 L350 315 L289 291 Z" fill="#df4d5c" stroke="#25201b" stroke-width="6"/>
                    <rect x="272" y="267" width="24" height="25" rx="6" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
                    <path d="M288 291 L300 326" stroke="#25201b" stroke-width="7" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "chart_prop") {
            svg += `
                <g transform="rotate(10 313 292)">
                    <rect x="276" y="235" width="74" height="70" rx="8" fill="#fffaf0" stroke="#25201b" stroke-width="6"/>
                    <path d="M291 288 L308 264 L323 276 L339 248" fill="none" stroke="#48a77c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M289 293h48M289 248v45" stroke="#25201b" stroke-width="4" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "laptop_prop") {
            svg += `
                <g transform="rotate(10 310 296)">
                    <rect x="270" y="244" width="78" height="54" rx="7" fill="#2167a8" stroke="#25201b" stroke-width="6"/>
                    <path d="M260 315h100l-12-18h-76l-12 18Z" fill="#fffaf0" stroke="#25201b" stroke-width="6"/>
                    <path d="M299 270h22M288 284h44" stroke="#fffaf0" stroke-width="5" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "tablet_prop") {
            svg += `
                <g transform="rotate(14 308 292)">
                    <rect x="276" y="238" width="68" height="82" rx="11" fill="#27335f" stroke="#25201b" stroke-width="6"/>
                    <rect x="288" y="252" width="44" height="52" rx="5" fill="#e9fbff"/>
                    <path d="M296 268h28M296 282h22M296 296h30" stroke="#2167a8" stroke-width="4" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "poster_prop") {
            svg += `
                <g transform="rotate(-13 309 292)">
                    <rect x="276" y="239" width="76" height="94" rx="8" fill="#fffaf0" stroke="#25201b" stroke-width="6"/>
                    <rect x="289" y="253" width="50" height="30" rx="4" fill="#f4c434" stroke="#25201b" stroke-width="4"/>
                    <circle cx="302" cy="268" r="9" fill="#2167a8"/>
                    <path d="M321 256v26M292 306h46M292 318h34" stroke="#25201b" stroke-width="5" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "notebook_prop") {
            svg += `
                <g transform="rotate(15 309 291)">
                    <rect x="280" y="244" width="62" height="80" rx="8" fill="#fffaf0" stroke="#25201b" stroke-width="6"/>
                    <path d="M294 248v72M303 264h28M303 280h26M303 296h22" stroke="#2167a8" stroke-width="4" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "coffee_prop") {
            svg += `
                <g transform="rotate(-16 310 292)">
                    <path d="M286 253h52l-8 71h-36Z" fill="#fffaf0" stroke="#25201b" stroke-width="6"/>
                    <path d="M295 275h34" stroke="#df4d5c" stroke-width="10"/>
                    <path d="M297 246 C304 232 321 232 328 246" fill="none" stroke="#25201b" stroke-width="5" stroke-linecap="round"/>
                </g>
            `;
        }
        if (eq.prop === "pencil_prop") {
            svg += `
                <g transform="rotate(-32 305 287)">
                    <rect x="298" y="210" width="16" height="112" rx="5" fill="#f4c434" stroke="#25201b" stroke-width="5"/>
                    <path d="M298 202 L306 181 L314 202 Z" fill="#34302b" stroke="#25201b" stroke-width="5"/>
                    <path d="M298 307h16" stroke="#df4d5c" stroke-width="8"/>
                </g>
            `;
        }
        if (eq.hat && !knownHats.has(eq.hat)) svg += this.renderGenericHat(eq.hat, detailInk);
        if (eq.glasses && !knownGlasses.has(eq.glasses)) svg += this.renderGenericGlasses(eq.glasses, detailInk);
        if (eq.outfit && !knownOutfits.has(eq.outfit)) svg += this.renderGenericOutfit(eq.outfit, detailInk);
        if (eq.prop && !knownProps.has(eq.prop)) svg += this.renderGenericProp(eq.prop, detailInk);
        return svg;
    }

    renderGenericHat(itemId, detailInk = "#25201b") {
        const item = this.itemById(itemId);
        const accent = this.itemAccent(item, "#f4c434");
        const shadow = this.shiftColor(accent, -34);
        return `
            <path d="M126 93 C167 63 253 63 294 93 L278 118 C238 105 182 105 142 118 Z" fill="${accent}" stroke="#25201b" stroke-width="7"/>
            <path d="M137 103 C176 124 244 124 283 103" fill="${shadow}" stroke="${detailInk}" stroke-width="5" stroke-linecap="round" opacity=".75"/>
        `;
    }

    renderGenericGlasses(itemId, detailInk = "#25201b") {
        const item = this.itemById(itemId);
        const accent = this.itemAccent(item, "#58b7d8");
        return `
            <g fill="rgba(255,255,255,.18)" stroke="#25201b" stroke-width="7">
                <rect x="122" y="136" width="74" height="58" rx="18"/>
                <rect x="224" y="136" width="74" height="58" rx="18"/>
                <path d="M196 166 L224 166" fill="none"/>
                <path d="M139 165h40M241 165h40" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
                <circle cx="159" cy="165" r="5" fill="${accent}" stroke="${detailInk}" stroke-width="2"/>
                <circle cx="261" cy="165" r="5" fill="${accent}" stroke="${detailInk}" stroke-width="2"/>
            </g>
        `;
    }

    renderGenericOutfit(itemId, detailInk = "#25201b") {
        const item = this.itemById(itemId);
        const accent = this.itemAccent(item, "#2167a8");
        const light = this.shiftColor(accent, 28);
        const label = this.itemLabel(item);
        return `
            <path d="M139 255 C166 238 254 238 281 255 L299 346 C250 371 170 371 121 346 Z" fill="${accent}" stroke="#25201b" stroke-width="7"/>
            <path d="M182 254 L210 316 L238 254" fill="#fffaf0" stroke="#25201b" stroke-width="5"/>
            <rect x="178" y="289" width="64" height="44" rx="11" fill="${light}" stroke="${detailInk}" stroke-width="4"/>
            <text x="210" y="319" text-anchor="middle" font-size="23" font-weight="900" fill="#25201b" stroke="none">${label}</text>
        `;
    }

    renderGenericProp(itemId, detailInk = "#25201b") {
        const item = this.itemById(itemId);
        const accent = this.itemAccent(item, "#f4c434");
        const label = this.itemLabel(item).slice(0, 1) || "?";
        return `
            <g transform="rotate(11 309 292)">
                <rect x="278" y="242" width="68" height="84" rx="12" fill="#fffaf0" stroke="#25201b" stroke-width="6"/>
                <rect x="289" y="256" width="46" height="35" rx="8" fill="${accent}" stroke="${detailInk}" stroke-width="4"/>
                <text x="312" y="281" text-anchor="middle" font-size="21" font-weight="900" fill="#25201b" stroke="none">${label}</text>
                <path d="M291 304h42M291 316h28" stroke="${detailInk}" stroke-width="4.5" stroke-linecap="round"/>
            </g>
        `;
    }
}

window.MascotRender = Mascot;
