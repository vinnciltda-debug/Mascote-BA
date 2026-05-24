const DEFAULT_STATE = {
    version: 3,
    stats: {
        hunger: 0,
        health: 0,
        fun: 0,
        energy: 0,
        clean: 0
    },
    coins: 250,
    level: 1,
    xp: 0,
    inventory: ["nectar", "pollen_cookie", "soap", "yellow_body", "amber_stripes", "blue_wings", "classic_marking", "studio_wall"],
    itemCounts: {
        nectar: 1,
        pollen_cookie: 1
    },
    equipped: {
        bodyColor: "yellow_body",
        stripeColor: "amber_stripes",
        wingColor: "blue_wings",
        marking: "classic_marking",
        antenna: "classic_antenna",
        cheeks: "no_cheeks",
        aura: "no_aura",
        badge: "no_badge",
        eyes: "curious_eyes",
        mouth: "soft_smile",
        hat: null,
        glasses: null,
        outfit: null,
        prop: "brush_prop",
        bg: "studio_wall"
    },
    isSleeping: false,
    room: "bedroom",
    lastUpdated: Date.now(),
    dailySketchAt: 0
};

class StateManager {
    constructor() {
        this.state = this.migrate(Utils.loadData("ba_mascote_state", DEFAULT_STATE));
        this.listeners = [];
        this.calculateOfflineProgress();
        setInterval(() => this.tickLoop(), 1000);
    }

    migrate(saved) {
        const state = { ...Utils.clone(DEFAULT_STATE), ...saved };
        state.stats = { ...DEFAULT_STATE.stats, ...(saved.stats || {}) };
        state.equipped = { ...DEFAULT_STATE.equipped, ...(saved.equipped || {}) };
        state.itemCounts = { ...DEFAULT_STATE.itemCounts, ...(saved.itemCounts || {}) };
        state.inventory = Array.isArray(saved.inventory) ? [...new Set([...DEFAULT_STATE.inventory, ...saved.inventory])] : [...DEFAULT_STATE.inventory];
        ["curious_eyes", "soft_smile", "brush_prop", "classic_marking", "classic_antenna", "no_cheeks", "no_aura", "no_badge"].forEach(itemId => {
            if (!state.inventory.includes(itemId)) state.inventory.push(itemId);
        });
        if (!state.version || state.version < 3) {
            state.stats = Utils.clone(DEFAULT_STATE.stats);
            state.version = 3;
        }
        state.coins = Math.max(0, Number(state.coins) || DEFAULT_STATE.coins);
        return state;
    }

    resetAll() {
        this.state = Utils.clone(DEFAULT_STATE);
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.save();
        this.listeners.forEach(listener => listener(this.state));
    }

    save() {
        this.state.lastUpdated = Date.now();
        Utils.saveData("ba_mascote_state", this.state);
        this.updateUI();
    }

    calculateOfflineProgress() {
        const elapsedHours = Math.max(0, (Date.now() - (this.state.lastUpdated || Date.now())) / 3600000);
        if (elapsedHours > 0.03) {
            const decay = Math.min(38, elapsedHours * 7);
            this.changeStats({
                hunger: -decay,
                fun: -decay * 0.72,
                clean: -decay * 0.45,
                energy: this.state.isSleeping ? elapsedHours * 28 : -decay * 0.42
            }, false);
        }
        this.save();
    }

    sanitizeStat(value) {
        return Math.round(Utils.clamp(value, 0, 100) * 100) / 100;
    }

    tickLoop() {
        const s = this.state.stats;
        const changes = this.state.isSleeping
            ? { energy: 0.65, health: 0.22, hunger: -0.012, fun: -0.008 }
            : { hunger: -0.035, energy: -0.018, fun: -0.02, clean: -0.012 };

        const critical = s.hunger < 18 || s.fun < 18 || s.energy < 10 || s.clean < 18;
        if (critical) changes.health = -0.055;
        if (!critical && s.hunger > 70 && s.fun > 68 && s.clean > 55) changes.health = 0.025;

        this.changeStats(changes);
    }

    changeStats(changes, shouldNotify = true) {
        let changed = false;
        Object.entries(changes).forEach(([name, value]) => {
            if (this.state.stats[name] === undefined) return;
            const current = this.state.stats[name];
            const next = this.sanitizeStat(current + value);
            if (Math.abs(next - current) > 0.0005) {
                this.state.stats[name] = next;
                changed = true;
            }
        });
        if (shouldNotify && changed) this.notify();
        return changed;
    }

    addCoins(amount, shouldNotify = true) {
        const next = Math.max(0, this.state.coins + amount);
        if (next === this.state.coins) return false;
        this.state.coins = next;
        if (shouldNotify) this.notify();
        return true;
    }

    spendCoins(amount, shouldNotify = true) {
        if (this.state.coins < amount) return false;
        this.state.coins -= amount;
        if (shouldNotify) this.notify();
        return true;
    }

    addXp(amount, shouldNotify = true) {
        if (!amount) return false;
        this.state.xp += amount;
        let leveledUp = false;
        while (this.state.xp >= this.nextLevelXp()) {
            this.state.xp -= this.nextLevelXp();
            this.state.level += 1;
            leveledUp = true;
            Utils.audio.play("reward");
            Utils.showToast(`Nível ${this.state.level}: repertorio desbloqueado!`);
        }
        if (shouldNotify) this.notify();
        return leveledUp;
    }

    nextLevelXp() {
        return 80 + (this.state.level - 1) * 28;
    }

    buyItem(itemId) {
        const item = SHOP_ITEMS.find(entry => entry.id === itemId);
        if (!item || this.isLocked(item)) return false;
        if (!item.consumable && this.state.inventory.includes(itemId)) return true;
        if (!this.spendCoins(item.price || 0, false)) return false;
        if (item.consumable) {
            this.state.itemCounts[itemId] = (this.state.itemCounts[itemId] || 0) + 1;
            if (!this.state.inventory.includes(itemId)) this.state.inventory.push(itemId);
        } else {
            this.state.inventory.push(itemId);
        }
        this.notify();
        return true;
    }

    consumeItem(itemId) {
        const item = SHOP_ITEMS.find(entry => entry.id === itemId);
        if (item && item.consumable) {
            this.state.itemCounts[itemId] = Math.max(0, (this.state.itemCounts[itemId] || 0) - 1);
            if (this.state.itemCounts[itemId] === 0) {
                const index = this.state.inventory.indexOf(itemId);
                if (index >= 0) this.state.inventory.splice(index, 1);
            }
        } else {
            const index = this.state.inventory.indexOf(itemId);
            if (index >= 0) this.state.inventory.splice(index, 1);
        }
        this.notify();
    }

    getItemCount(itemId) {
        const item = SHOP_ITEMS.find(entry => entry.id === itemId);
        if (!item) return 0;
        if (item.consumable) return this.state.itemCounts[itemId] || 0;
        return this.state.inventory.includes(itemId) || item.price === 0 ? 1 : 0;
    }

    equipItem(slot, itemId) {
        const item = SHOP_ITEMS.find(entry => entry.id === itemId);
        const ownsItem = this.state.inventory.includes(itemId) || (item && item.price === 0);
        if (!item || !ownsItem || this.isLocked(item)) return;

        const essentialSlots = ["bodyColor", "stripeColor", "wingColor", "marking", "antenna", "cheeks", "aura", "badge", "eyes", "mouth", "bg"];
        if (this.state.equipped[slot] === itemId && !essentialSlots.includes(slot)) {
            this.state.equipped[slot] = null;
        } else {
            this.state.equipped[slot] = itemId;
        }
        this.notify();
    }

    isLocked(item) {
        return Boolean(item.level && this.state.level < item.level);
    }

    toggleSleep() {
        this.state.isSleeping = !this.state.isSleeping;
        this.notify();
        return this.state.isSleeping;
    }

    claimDailySketch() {
        const now = Date.now();
        if (now - (this.state.dailySketchAt || 0) < 1000 * 60 * 60 * 8) {
            Utils.showToast("A banca já elogiou seu estudo hoje.");
            return false;
        }
        this.state.dailySketchAt = now;
        this.addCoins(75, false);
        this.addXp(12, false);
        this.notify();
        Utils.audio.play("reward");
        Utils.showToast("+75 moedas por estudo de observação!");
        return true;
    }

    updateUI() {
        const { stats, coins, level } = this.state;
        const setHeight = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.style.height = `${Utils.clamp(value, 0, 100)}%`;
        };
        setHeight("hunger-bar", stats.hunger);
        setHeight("health-bar", stats.health);
        setHeight("fun-bar", stats.fun);
        setHeight("energy-bar", stats.energy);
        setHeight("clean-bar", stats.clean);

        const coinCount = document.getElementById("coin-count");
        const levelText = document.getElementById("level-text");
        if (coinCount) coinCount.textContent = Math.floor(coins);
        if (levelText) levelText.textContent = level;
    }
}

window.State = new StateManager();

