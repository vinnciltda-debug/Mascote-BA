class Minigame {
    constructor() {
        this.container = document.getElementById("minigame-container");
        this.canvas = document.getElementById("minigame-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.closeBtn = document.getElementById("close-minigame");
        this.titleEl = this.container.querySelector(".minigame-header strong");
        this.subtitleEl = this.container.querySelector(".minigame-header small");
        this.menu = document.createElement("div");
        this.menu.className = "game-menu";
        this.container.appendChild(this.menu);

        this.games = [
            { id: "references", name: "Referencia", icon: "gallery", note: "arraste a abelha e colete obras", tip: "Arraste para pegar obras. Evite tinta.", energy: 8, duration: 60, baseCoins: 16, coinRate: .2, maxCoins: 260, maxErrors: 8 },
            { id: "palette", name: "Cor certa", icon: "palette", note: "toque na cor pedida", tip: "Leia a cor e toque no circulo certo.", energy: 8, duration: 38, baseCoins: 12, coinRate: .24, maxCoins: 210, maxErrors: 4 },
            { id: "restoration", name: "Restauro", icon: "care", note: "toque nas manchas da obra", tip: "Toque nas manchas antes que sumam.", energy: 9, duration: 42, baseCoins: 16, coinRate: .23, maxCoins: 230, maxErrors: 5 },
            { id: "curatorship", name: "Curadoria", icon: "frame", note: "toque na obra do pedido", tip: "Veja o pedido e escolha a obra.", energy: 10, duration: 42, baseCoins: 16, coinRate: .25, maxCoins: 250, maxErrors: 5 }
        ];

        this.isActive = false;
        this.mode = null;
        this.score = 0;
        this.missed = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.actions = 0;
        this.roundsCleared = 0;
        this.timeLeft = 0;
        this.elapsed = 0;
        this.currentGame = null;
        this.speed = 2.25;
        this.player = { x: 0, y: 0, width: 88, height: 70 };
        this.drops = [];
        this.targets = [];
        this.pointer = { x: 0, y: 0 };
        this.lastTick = 0;
        this.playerSprite = null;
        this.playerSpriteMarkup = "";
        this.bindEvents();
        this.renderMenu();
    }

    bindEvents() {
        this.closeBtn.onclick = () => this.close();

        const move = event => {
            if (!this.isActive) return;
            event.preventDefault();
            const point = event.touches ? event.touches[0] : event;
            const rect = this.canvas.getBoundingClientRect();
            this.pointer.x = point.clientX - rect.left;
            this.pointer.y = point.clientY - rect.top;
            if (this.mode === "references") {
                this.player.x = this.pointer.x - this.player.width / 2;
                this.keepPlayerInBounds();
            }
        };

        const tap = event => {
            if (!this.isActive) return;
            move(event);
            if (this.mode === "palette") this.handlePaletteTap();
            if (this.mode === "restoration") this.handleRestorationTap();
            if (this.mode === "curatorship") this.handleCuratorshipTap();
        };

        this.canvas.addEventListener("touchmove", move, { passive: false });
        this.canvas.addEventListener("mousemove", move);
        this.canvas.addEventListener("click", tap);
        this.canvas.addEventListener("touchstart", tap, { passive: false });
        window.addEventListener("resize", () => {
            if (this.isActive || !this.container.classList.contains("hidden")) this.resize();
        });
    }

    start() {
        if (State.state.isSleeping) {
            Utils.showToast("Acorde a abelha antes de brincar.");
            return;
        }
        this.container.classList.remove("hidden");
        this.isActive = false;
        this.mode = null;
        this.canvas.classList.add("hidden");
        this.menu.classList.remove("hidden");
        this.subtitleEl.textContent = "Jogos BA";
        this.titleEl.textContent = "Escolha um jogo";
        this.renderMenu();
    }

    renderMenu() {
        this.menu.innerHTML = "";
        this.games.forEach(game => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "game-card";
            card.innerHTML = `
                <div class="game-card-icon">${Utils.icon(game.icon)}</div>
                <div>
                    <strong>${game.name}</strong>
                    <span>${game.note}</span>
                    <small>${game.energy} energia - até ${game.maxCoins} moedas</small>
                </div>
                <b class="game-reward">+${game.baseCoins} base</b>
            `;
            card.onclick = () => this.startGame(game.id);
            this.menu.appendChild(card);
        });
    }

    startGame(mode) {
        const game = this.games.find(entry => entry.id === mode);
        if (!game) return;
        if (State.state.stats.energy < game.energy) {
            Utils.showToast("Energia baixa para esse estudo.");
            return;
        }

        this.currentGame = game;
        this.mode = mode;
        this.isActive = true;
        this.score = 0;
        this.missed = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.actions = 0;
        this.roundsCleared = 0;
        this.speed = this.mode === "references" ? 2.15 : 2.6;
        this.drops = [];
        this.targets = [];
        this.timeLeft = game.duration;
        this.elapsed = 0;
        this.lastTick = performance.now();
        Utils.audio.play("open");

        this.menu.classList.add("hidden");
        this.canvas.classList.remove("hidden");
        this.subtitleEl.textContent = "Como jogar";
        this.titleEl.textContent = game.name;
        this.resize();
        this.player.x = this.width / 2 - this.player.width / 2;
        this.player.y = this.height - 100;
        this.updatePlayerSprite();
        State.changeStats({ energy: -game.energy });

        if (mode === "palette") this.setupPaletteRound();
        if (mode === "restoration") this.setupRestorationRound();
        if (mode === "curatorship") this.setupCuratorshipRound();
        if (game.tip) Utils.showToast(game.tip);
        this.loop();
    }

    close() {
        if (this.isActive) this.stop(false);
        this.container.classList.add("hidden");
        this.menu.classList.add("hidden");
        this.canvas.classList.add("hidden");
    }

    stop(showReward = true) {
        if (!this.isActive) return;
        this.isActive = false;
        const reward = this.calculateReward();
        if (showReward) {
            if (this.score > 0) {
                State.addCoins(reward.coins, false);
                State.addXp(reward.xp, false);
                State.changeStats({ fun: reward.fun, energy: -1 }, false);
                State.notify();
                Utils.audio.play("reward");
                Utils.showToast(`${this.currentGameName()}: ${this.score} pts | +${reward.coins} moedas | +${reward.xp} xp`);
            } else {
                Utils.showToast(`${this.currentGameName()}: tente mais uma rodada para pontuar.`);
            }
        }
        if (showReward) this.start();
        else {
            this.mode = null;
            this.currentGame = null;
            this.menu.classList.add("hidden");
            this.canvas.classList.add("hidden");
        }
    }

    currentGameName() {
        return this.currentGame?.name || this.games.find(game => game.id === this.mode)?.name || "Jogo";
    }

    calculateReward() {
        const game = this.currentGame || this.games[0];
        const attempts = Math.max(1, this.actions);
        const accuracy = Utils.clamp((attempts - this.missed) / attempts, 0, 1);
        const normalizedScore = Math.min(160, this.score);
        const performanceFactor = 0.62 + Math.min(0.48, normalizedScore / 260);
        const streakFactor = Math.min(0.28, this.bestCombo * 0.03);
        const roundFactor = Math.min(0.24, this.roundsCleared * 0.02);
        const accuracyFactor = accuracy * 0.34;
        const mistakePenalty = Math.min(0.38, this.missed * 0.065);
        const gross = game.baseCoins * (1 + performanceFactor + streakFactor + roundFactor + accuracyFactor);
        const adjustedCoins = gross * (1 - mistakePenalty);
        const hardCap = Math.min(140, game.maxCoins || 140);
        const coins = Utils.clamp(Math.floor(adjustedCoins), 8, hardCap);
        return {
            coins,
            xp: Math.min(90, 8 + Math.floor(this.score / 14) + this.roundsCleared),
            fun: Math.min(30, 8 + Math.floor(this.score / 2.4))
        };
    }

    markSuccess(points, roundCleared = false) {
        this.actions += 1;
        this.combo += 1;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.score += points + Math.floor(this.combo / 4);
        if (this.actions % 2 === 0 || roundCleared) Utils.audio.play("success");
        if (roundCleared) {
            this.roundsCleared += 1;
            this.score += 4;
        }
    }

    markMistake(amount = 1) {
        this.actions += amount;
        this.missed += amount;
        this.combo = 0;
        Utils.audio.play("miss");
        if (this.missed >= (this.currentGame?.maxErrors || 5)) this.stop();
    }

    resize() {
        const ratio = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.floor(rect.width * ratio);
        this.canvas.height = Math.floor(rect.height * ratio);
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.width = rect.width;
        this.height = rect.height;
        this.player.y = this.height - 100;
        this.keepPlayerInBounds();
    }

    keepPlayerInBounds() {
        this.player.x = Utils.clamp(this.player.x, 22, this.width - this.player.width - 22);
    }

    update(delta) {
        this.timeLeft -= delta;
        this.elapsed += delta;
        if (this.timeLeft <= 0) this.stop();
        if (!this.isActive) return;
        if (this.mode === "references") this.updateReferences();
        if (this.mode === "palette") this.updateTimedTargets();
        if (this.mode === "restoration") this.updateTimedTargets();
        if (this.mode === "curatorship") this.updateCuratorship();
    }

    setupPaletteRound() {
        const palette = [
            { name: "Ocre", color: "#df8b1d" },
            { name: "Carmim", color: "#c8464a" },
            { name: "Cianotipo", color: "#2167a8" },
            { name: "Verdigris", color: "#48a77c" }
        ];
        const answer = palette[Math.floor(Math.random() * palette.length)];
        this.targets = palette.map((color, index) => ({
            ...color,
            answer: color.name === answer.name,
            x: 42 + index * ((this.width - 84) / 4) + Math.min(74, (this.width - 80) / 4) / 2,
            y: this.height / 2,
            size: Math.min(74, (this.width - 80) / 4)
        }));
        this.prompt = answer.name;
    }

    handlePaletteTap() {
        const hit = this.targets.find(target => this.distance(this.pointer, target) < target.size / 1.7);
        if (!hit) return;
        if (hit.answer) {
            this.markSuccess(4, true);
            this.setupPaletteRound();
        } else {
            this.markMistake();
        }
    }

    setupRestorationRound() {
        this.targets = Array.from({ length: 7 }, () => ({
            x: 44 + Math.random() * (this.width - 88),
            y: 132 + Math.random() * (this.height - 210),
            size: 28 + Math.random() * 18,
            cleaned: false,
            timer: 5 + Math.random() * 8
        }));
    }

    handleRestorationTap() {
        const stain = this.targets.find(target => !target.cleaned && this.distance(this.pointer, target) < target.size);
        if (!stain) {
            this.markMistake();
            return;
        }
        stain.cleaned = true;
        const finished = this.targets.every(target => target.cleaned);
        this.markSuccess(3, finished);
        if (finished) this.setupRestorationRound();
    }

    setupCuratorshipRound() {
        const works = [
            { label: "abstrata", color: "#f4c434", accent: "#2167a8", kind: "abstract" },
            { label: "retrato", color: "#c8464a", accent: "#fffaf0", kind: "portrait" },
            { label: "paisagem", color: "#48a77c", accent: "#8ddbe0", kind: "landscape" },
            { label: "escultura", color: "#7761a8", accent: "#f4e5bd", kind: "sculpture" }
        ];
        const shuffled = [...works].sort(() => Math.random() - 0.5);
        const answer = shuffled[Math.floor(Math.random() * shuffled.length)];
        const cardW = Math.min(118, (this.width - 54) / 2);
        const cardH = 112;
        this.prompt = answer.label;
        this.targets = shuffled.map((work, index) => ({
            ...work,
            answer: work.label === answer.label,
            x: this.width / 2 + (index % 2 === 0 ? -cardW / 2 - 12 : cardW / 2 + 12),
            y: 210 + Math.floor(index / 2) * (cardH + 28),
            width: cardW,
            height: cardH,
            selected: false,
            wobble: Math.random() * Math.PI * 2
        }));
    }

    handleCuratorshipTap() {
        const hit = this.targets.find(target =>
            this.pointer.x > target.x - target.width / 2 &&
            this.pointer.x < target.x + target.width / 2 &&
            this.pointer.y > target.y - target.height / 2 &&
            this.pointer.y < target.y + target.height / 2
        );
        if (!hit) return;
        if (hit.selected) return;
        if (hit.answer) {
            hit.selected = true;
            this.markSuccess(6, true);
            setTimeout(() => {
                if (this.isActive && this.mode === "curatorship") this.setupCuratorshipRound();
            }, 180);
        } else {
            this.markMistake();
        }
    }

    updateTimedTargets() {
        if (this.mode === "palette" && this.targets.length === 0) this.setupPaletteRound();
        if (this.mode === "restoration") {
            this.targets.forEach(target => {
                if (!target.cleaned) target.timer -= 1 / 60;
            });
            const expired = this.targets.filter(target => !target.cleaned && target.timer <= 0);
            if (expired.length) {
                this.markMistake(expired.length);
                if (!this.isActive) return;
                expired.forEach(target => target.cleaned = true);
            }
            if (this.targets.every(target => target.cleaned)) this.setupRestorationRound();
        }
    }

    updateCuratorship() {
        this.targets.forEach((work, index) => {
            work.wobble += 0.015 + index * 0.001;
        });
    }

    updateReferences() {
        this.spawnDrop();
        for (let i = this.drops.length - 1; i >= 0; i -= 1) {
            const drop = this.drops[i];
            drop.y += this.speed;
            drop.rotation += drop.rotSpeed;
            const hit = drop.y + drop.size > this.player.y - 2 &&
                drop.y < this.player.y + this.player.height + 2 &&
                drop.x + drop.size > this.player.x - 3 &&
                drop.x < this.player.x + this.player.width + 3;

            if (hit) {
                if (drop.danger) {
                    this.markMistake();
                } else {
                    this.markSuccess(drop.points + 1);
                }
                if (!this.isActive) return;
                this.drops.splice(i, 1);
                if (this.score > 0 && this.score % 12 === 0) this.speed += 0.16;
            } else if (drop.y > this.height + 30) {
                if (!drop.danger) this.markMistake();
                if (!this.isActive) return;
                this.drops.splice(i, 1);
            }
        }
    }

    spawnDrop() {
        if (Math.random() > 0.026 + this.speed * 0.0045) return;
        const pool = [
            { kind: "frame", color: "#f4c434", points: 1, danger: false },
            { kind: "brush", color: "#c8464a", points: 1, danger: false },
            { kind: "palette", color: "#48a77c", points: 2, danger: false },
            { kind: "star", color: "#2167a8", points: 3, danger: false },
            { kind: "ink", color: "#34302b", points: 0, danger: true }
        ];
        const elapsed = (this.currentGame?.duration || 45) - this.timeLeft;
        const dangerChance = Math.min(0.22, 0.05 + elapsed * 0.0022 + this.score * 0.0017);
        const safePool = pool.filter(item => !item.danger);
        const type = Math.random() < dangerChance ? pool.find(item => item.kind === "ink") : safePool[Math.floor(Math.random() * safePool.length)];
        this.drops.push({
            ...type,
            x: Math.random() * (this.width - 50) + 20,
            y: 112,
            size: type.points > 1 ? 36 : 32,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08
        });
    }

    draw() {
        this.drawBackdrop();
        this.drawHud();
        if (this.mode === "references") {
            this.drops.forEach(drop => this.drawDrop(drop));
            this.drawPlayer();
        }
        if (this.mode === "palette") this.drawPaletteGame();
        if (this.mode === "restoration") this.drawRestorationGame();
        if (this.mode === "curatorship") this.drawCuratorshipGame();
    }

    drawBackdrop() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        const palette = {
            references: "#fff7e8",
            palette: "#fff0c8",
            restoration: "#e8f6f0",
            curatorship: "#edf5ff"
        };
        this.ctx.fillStyle = palette[this.mode] || "#fff7e8";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = "rgba(37,32,27,.11)";
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.width; x += 34) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        this.ctx.fillStyle = "rgba(37,32,27,.08)";
        this.ctx.fillRect(0, this.height - 76, this.width, 76);
        this.ctx.fillStyle = "rgba(255,255,255,.32)";
        this.ctx.fillRect(0, 72, this.width, 8);
    }

    drawHud() {
        this.drawHudChip(16, 78, 124, `Pontos ${this.score}`);
        const errorsLeft = Math.max(0, (this.currentGame?.maxErrors || 5) - this.missed);
        const right = `${Math.ceil(Math.max(0, this.timeLeft))}s  Vida ${errorsLeft}`;
        this.drawHudChip(this.width - 156, 78, 140, right);
        if (this.combo >= 3) this.drawHudChip(this.width / 2 - 54, 118, 108, `Combo ${this.combo}`);
        if (this.elapsed < 4.2 && this.currentGame?.tip) this.drawTip(this.currentGame.tip);
    }

    drawHudChip(x, y, width, text) {
        this.ctx.fillStyle = "rgba(248, 250, 252, .9)";
        this.ctx.strokeStyle = "rgba(15, 23, 42, .18)";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.roundRect(x, y, width, 34, 13);
        this.ctx.fill();
        this.ctx.stroke();
        this.drawText(text, x + width / 2, y + 22, 16, "center", false);
    }

    drawTip(text) {
        const boxW = Math.min(this.width - 28, 360);
        const x = (this.width - boxW) / 2;
        this.ctx.fillStyle = "rgba(15, 23, 42, .9)";
        this.ctx.strokeStyle = "rgba(255, 255, 255, .22)";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.roundRect(x, 122, boxW, 40, 16);
        this.ctx.fill();
        this.ctx.stroke();
        this.drawText(text, this.width / 2, 147, 14, "center", false, "#ffffff");
    }

    drawPaletteGame() {
        const y = this.elapsed < 4.2 ? 184 : 140;
        this.drawText(`Cor: ${this.prompt}`, this.width / 2, y, 20, "center", false);
        this.targets.forEach(target => {
            this.ctx.fillStyle = target.color;
            this.ctx.strokeStyle = "#25201b";
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.drawText(target.name, target.x, target.y + target.size / 2 + 24, 14, "center");
        });
    }

    drawRestorationGame() {
        const artX = 44;
        const artY = 132;
        const artW = this.width - 88;
        const artH = this.height - 190;
        this.ctx.fillStyle = "#f4e5bd";
        this.ctx.strokeStyle = "#25201b";
        this.ctx.lineWidth = 4;
        this.ctx.fillRect(artX, artY, artW, artH);
        this.ctx.strokeRect(artX, artY, artW, artH);
        this.ctx.fillStyle = "#c8464a";
        this.ctx.fillRect(artX + 20, artY + 24, artW * 0.38, artH * 0.32);
        this.ctx.fillStyle = "#2167a8";
        this.ctx.fillRect(artX + artW * 0.52, artY + artH * 0.42, artW * 0.3, artH * 0.36);
        this.targets.forEach(target => {
            if (target.cleaned) return;
            this.ctx.fillStyle = "rgba(52,48,43,.78)";
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = "#fffaf0";
            this.ctx.font = "900 18px Trebuchet MS, Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText("!", target.x, target.y);
        });
    }

    drawCuratorshipGame() {
        const titleY = this.elapsed < 4.2 ? 184 : 140;
        this.drawText(`Pedido: ${this.prompt}`, this.width / 2, titleY, 20, "center", false);
        if (this.elapsed >= 4.2) this.drawText("Toque na obra certa", this.width / 2, 164, 15, "center", false);
        this.targets.forEach(work => {
            const tilt = Math.sin(work.wobble) * 0.035;
            this.ctx.save();
            this.ctx.translate(work.x, work.y);
            this.ctx.rotate(tilt);
            this.ctx.fillStyle = work.selected ? "#e6ffe9" : "#fffaf0";
            this.ctx.strokeStyle = "#25201b";
            this.ctx.lineWidth = work.selected ? 5 : 3;
            this.ctx.beginPath();
            this.roundRect(-work.width / 2, -work.height / 2, work.width, work.height, 12);
            this.ctx.fill();
            this.ctx.stroke();
            this.drawCuratedWork(work, -work.width / 2 + 12, -work.height / 2 + 12, work.width - 24, work.height - 42);
            this.ctx.restore();
            this.drawText(work.label, work.x, work.y + work.height / 2 - 10, 14, "center");
        });
    }

    drawCuratedWork(work, x, y, width, height) {
        this.ctx.fillStyle = work.color;
        this.ctx.strokeStyle = "#25201b";
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.roundRect(x, y, width, height, 7);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = work.accent;
        if (work.kind === "portrait") {
            this.ctx.beginPath();
            this.ctx.arc(x + width / 2, y + height * 0.38, height * 0.18, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillRect(x + width * 0.34, y + height * 0.62, width * 0.32, height * 0.22);
        } else if (work.kind === "landscape") {
            this.ctx.beginPath();
            this.ctx.moveTo(x + 8, y + height - 10);
            this.ctx.lineTo(x + width * 0.42, y + height * 0.44);
            this.ctx.lineTo(x + width * 0.66, y + height * 0.68);
            this.ctx.lineTo(x + width - 8, y + height * 0.32);
            this.ctx.lineTo(x + width - 8, y + height - 10);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (work.kind === "sculpture") {
            this.ctx.beginPath();
            this.ctx.arc(x + width / 2, y + height * 0.36, height * 0.16, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillRect(x + width * 0.42, y + height * 0.5, width * 0.16, height * 0.34);
            this.ctx.fillRect(x + width * 0.3, y + height * 0.82, width * 0.4, height * 0.09);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x + width * 0.32, y + height * 0.38, 13, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillRect(x + width * 0.5, y + height * 0.22, width * 0.32, height * 0.5);
        }
    }

    drawText(text, x, y, size, align = "left", stroke = true, color = "#111827") {
        this.ctx.font = `800 ${size}px Segoe UI, Trebuchet MS, Arial`;
        this.ctx.textAlign = align;
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "rgba(248,250,252,.82)";
        this.ctx.fillStyle = color;
        if (stroke) this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
    }

    drawDrop(drop) {
        this.ctx.save();
        this.ctx.translate(drop.x + drop.size / 2, drop.y + drop.size / 2);
        this.ctx.rotate(drop.rotation);
        this.ctx.strokeStyle = "#25201b";
        this.ctx.lineWidth = 3;
        if (drop.kind === "brush") this.drawBrushDrop(drop);
        else if (drop.kind === "palette") this.drawPaletteDrop(drop);
        else if (drop.kind === "star") this.drawStarDrop(drop);
        else if (drop.kind === "ink") this.drawInkDrop(drop);
        else this.drawFrameDrop(drop);
        this.ctx.restore();
    }

    drawFrameDrop(drop) {
        const s = drop.size;
        this.ctx.fillStyle = drop.color;
        this.ctx.beginPath();
        this.roundRect(-s / 2, -s / 2, s, s, 7);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = "#fffaf0";
        this.ctx.fillRect(-s / 4, -s / 4, s / 2, s / 2);
        this.ctx.strokeRect(-s / 4, -s / 4, s / 2, s / 2);
    }

    drawBrushDrop(drop) {
        this.ctx.fillStyle = "#8b5831";
        this.ctx.fillRect(-4, -16, 8, 28);
        this.ctx.strokeRect(-4, -16, 8, 28);
        this.ctx.fillStyle = drop.color;
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 16);
        this.ctx.quadraticCurveTo(0, 27, 8, 16);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawPaletteDrop(drop) {
        const s = drop.size;
        this.ctx.fillStyle = "#b6753a";
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, s / 2, s / 2.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        [["#f4c434", -7, -4], ["#c8464a", 6, -3], ["#2167a8", -2, 7]].forEach(([color, x, y]) => {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawStarDrop(drop) {
        this.ctx.fillStyle = drop.color;
        this.ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
            const radius = i % 2 === 0 ? drop.size / 2 : drop.size / 5;
            const angle = -Math.PI / 2 + i * Math.PI / 5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawInkDrop(drop) {
        this.ctx.fillStyle = drop.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, drop.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = "#fffaf0";
        this.ctx.font = "900 22px Trebuchet MS, Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("!", 0, 1);
    }

    roundRect(x, y, width, height, radius) {
        if (this.ctx.roundRect) {
            this.ctx.roundRect(x, y, width, height, radius);
            return;
        }
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    drawPlayer() {
        const p = this.player;
        this.updatePlayerSprite();
        if (this.playerSprite?.complete) {
            this.ctx.drawImage(this.playerSprite, p.x - 6, p.y - 20, p.width + 12, p.height + 24);
            return;
        }
        this.ctx.save();
        this.ctx.fillStyle = "#f6cf3d";
        this.ctx.strokeStyle = "#1f2937";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2.25, p.height / 2.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    updatePlayerSprite() {
        const host = document.getElementById("mascot-container");
        const svg = host?.querySelector("svg");
        if (!svg) return;
        const markup = svg.outerHTML;
        if (markup === this.playerSpriteMarkup && this.playerSprite) return;
        this.playerSpriteMarkup = markup;
        const data = encodeURIComponent(markup);
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${data}`;
        this.playerSprite = img;
    }

    distance(point, target) {
        return Math.hypot(point.x - target.x, point.y - target.y);
    }

    loop(now = performance.now()) {
        if (!this.isActive) return;
        const delta = Math.min(0.05, (now - this.lastTick) / 1000 || 0.016);
        this.lastTick = now;
        this.update(delta);
        if (this.isActive) {
            this.draw();
            requestAnimationFrame(time => this.loop(time));
        }
    }
}

window.MinigameInstance = Minigame;

