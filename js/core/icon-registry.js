window.BAIconRegistry = (() => {
    const EMOJI = {
        coin: "🪙",
        shop: "🏪",
        closet: "🧥",
        sleep: "🌙",
        wake: "☀️",
        canteen: "🍽️",
        bath: "🛁",
        care: "💚",
        game: "🎮",
        ball: "⚽",
        nectar: "🍯",
        cookie: "🍪",
        stillLife: "🎨",
        sandwich: "🥪",
        soap: "🧼",
        tonic: "🧪",
        color: "🎨",
        stripes: "🟨",
        wings: "🪽",
        eyes: "👀",
        mouth: "😊",
        beret: "👒",
        glasses: "🕶️",
        apron: "👕",
        brush: "🖌️",
        chisel: "🪓",
        frame: "🖼️",
        gallery: "🏛️",
        print: "🧾",
        mural: "🧱",
        sparkle: "✨",
        palette: "🎨",
        badge: "🏷️",
        cap: "🎓",
        newspaper: "📰",
        microphone: "🎤",
        camera: "📷",
        megaphone: "📣",
        chart: "📈",
        calculator: "🧮",
        laptop: "💻",
        poster: "🪧",
        ruler: "📐",
        target: "🎯",
        uniform: "👔",
        vest: "🦺",
        blazer: "🧥",
        hoodie: "🧢",
        question: "❔"
    };

    function render(name, options = {}) {
        const token = EMOJI[name];
        if (!token) return "";
        const accent = options.accent ? ` style="--icon-accent:${options.accent}"` : "";
        return `<span class="emoji-icon"${accent} aria-hidden="true">${token}</span>`;
    }

    return { render };
})();
