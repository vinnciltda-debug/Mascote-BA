import { ITEM_CATALOG } from "./catalog";
import type { GameState, ItemDefinition, ItemSlot, PurchaseResult, StatKey } from "./types";
import { validateCatalog } from "./validation";

const SAVE_KEY = "ba_mascote_state_v2";
const LEGACY_KEY = "ba_mascote_state";
const DEFAULT_STATS: Record<StatKey, number> = { hunger: 0, health: 0, fun: 0, energy: 0, clean: 0 };

export const DEFAULT_STATE: GameState = {
  version: 2,
  coins: 250,
  level: 1,
  xp: 0,
  stats: { ...DEFAULT_STATS },
  inventory: ["yellow_body", "amber_stripes", "blue_wings", "studio_wall", "brush_prop", "nectar"],
  itemCounts: { nectar: 1 },
  equipped: {
    bodyColor: "yellow_body",
    stripeColor: "amber_stripes",
    wingColor: "blue_wings",
    outfit: null,
    hat: null,
    glasses: null,
    prop: "brush_prop",
    bg: "studio_wall"
  },
  room: "bedroom",
  isSleeping: false,
  updatedAt: Date.now()
};

export class GameStore {
  private state: GameState;
  private listeners = new Set<(state: GameState) => void>();
  readonly byId = new Map<string, ItemDefinition>();

  constructor() {
    validateCatalog(ITEM_CATALOG);
    ITEM_CATALOG.forEach((item) => this.byId.set(item.id, item));
    this.state = this.load();
    this.tickOffline();
  }

  get snapshot(): GameState {
    return structuredClone(this.state);
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  setRoom(room: string): void {
    this.state.room = room;
    this.commit();
  }

  isLocked(item: ItemDefinition): boolean {
    const needed = item.unlockRule.minLevel ?? 0;
    return this.state.level < needed;
  }

  owns(itemId: string): boolean {
    const item = this.byId.get(itemId);
    if (!item) return false;
    if (item.consumable) return (this.state.itemCounts[itemId] ?? 0) > 0;
    return this.state.inventory.includes(itemId) || item.price === 0;
  }

  count(itemId: string): number {
    const item = this.byId.get(itemId);
    if (!item) return 0;
    if (item.consumable) return this.state.itemCounts[itemId] ?? 0;
    return this.owns(itemId) ? 1 : 0;
  }

  purchase(itemId: string): PurchaseResult {
    const item = this.byId.get(itemId);
    if (!item) return { ok: false, reason: "invalid" };
    if (this.isLocked(item)) return { ok: false, reason: "locked" };
    if (!item.consumable && this.owns(itemId)) return { ok: false, reason: "already_owned" };
    if (this.state.coins < item.price) return { ok: false, reason: "coins" };
    this.state.coins -= item.price;
    if (item.consumable) {
      this.state.itemCounts[itemId] = (this.state.itemCounts[itemId] ?? 0) + 1;
      if (!this.state.inventory.includes(itemId)) this.state.inventory.push(itemId);
    } else {
      this.state.inventory.push(itemId);
      this.state.equipped[item.slot] = itemId;
    }
    this.commit();
    return { ok: true };
  }

  equip(itemId: string): boolean {
    const item = this.byId.get(itemId);
    if (!item || !this.owns(itemId) || this.isLocked(item)) return false;
    const slot = item.slot;
    const current = this.state.equipped[slot];
    const toggleSlots: ItemSlot[] = ["hat", "glasses", "outfit", "prop", "badge", "aura", "cheeks"];
    if (current === itemId && toggleSlots.includes(slot)) this.state.equipped[slot] = null;
    else this.state.equipped[slot] = itemId;
    this.commit();
    return true;
  }

  consume(itemId: string): boolean {
    const item = this.byId.get(itemId);
    if (!item || !item.consumable || this.count(itemId) <= 0) return false;
    this.state.itemCounts[itemId] = Math.max(0, (this.state.itemCounts[itemId] ?? 0) - 1);
    if (this.state.itemCounts[itemId] === 0) {
      this.state.inventory = this.state.inventory.filter((id) => id !== itemId);
    }
    if (item.effect) this.changeStats(item.effect);
    this.addXp(6);
    this.commit();
    return true;
  }

  addCoins(amount: number): void {
    this.state.coins = Math.max(0, Math.floor(this.state.coins + amount));
    this.commit();
  }

  addXp(amount: number): void {
    this.state.xp += amount;
    while (this.state.xp >= this.nextLevelXp()) {
      this.state.xp -= this.nextLevelXp();
      this.state.level += 1;
    }
  }

  changeStats(partial: Partial<Record<StatKey, number>>): void {
    (Object.keys(partial) as StatKey[]).forEach((key) => {
      const delta = partial[key] ?? 0;
      this.state.stats[key] = clamp100(this.state.stats[key] + delta);
    });
  }

  private nextLevelXp(): number {
    return 80 + (this.state.level - 1) * 28;
  }

  private tickOffline(): void {
    const elapsedHours = Math.max(0, (Date.now() - this.state.updatedAt) / 3600000);
    if (elapsedHours < 0.05) return;
    const decay = Math.min(35, elapsedHours * 7);
    this.changeStats({ hunger: -decay, clean: -decay * 0.5, fun: -decay * 0.65, energy: this.state.isSleeping ? elapsedHours * 30 : -decay * 0.45 });
    this.commit();
  }

  private commit(): void {
    this.state.updatedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    const snap = this.snapshot;
    this.listeners.forEach((listener) => listener(snap));
  }

  private load(): GameState {
    const modern = this.parse(localStorage.getItem(SAVE_KEY));
    if (modern) return this.sanitize(modern);
    const legacy = this.parse(localStorage.getItem(LEGACY_KEY));
    if (legacy) {
      const migrated = this.fromLegacy(legacy);
      localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return this.sanitize(structuredClone(DEFAULT_STATE));
  }

  private fromLegacy(raw: any): GameState {
    const equipped = raw?.equipped ?? {};
    return this.sanitize({
      version: 2,
      coins: Number(raw?.coins ?? 250),
      level: Number(raw?.level ?? 1),
      xp: Number(raw?.xp ?? 0),
      stats: {
        hunger: Number(raw?.stats?.hunger ?? 0),
        health: Number(raw?.stats?.health ?? 0),
        fun: Number(raw?.stats?.fun ?? 0),
        energy: Number(raw?.stats?.energy ?? 0),
        clean: Number(raw?.stats?.clean ?? 0)
      },
      inventory: Array.isArray(raw?.inventory) ? raw.inventory : [],
      itemCounts: typeof raw?.itemCounts === "object" && raw?.itemCounts ? raw.itemCounts : {},
      equipped: {
        bodyColor: equipped.bodyColor ?? "yellow_body",
        stripeColor: equipped.stripeColor ?? "amber_stripes",
        wingColor: equipped.wingColor ?? "blue_wings",
        marking: equipped.marking ?? null,
        antenna: equipped.antenna ?? null,
        cheeks: equipped.cheeks ?? null,
        aura: equipped.aura ?? null,
        badge: equipped.badge ?? null,
        eyes: equipped.eyes ?? null,
        mouth: equipped.mouth ?? null,
        hat: equipped.hat ?? null,
        glasses: equipped.glasses ?? null,
        outfit: equipped.outfit ?? null,
        prop: equipped.prop ?? "brush_prop",
        bg: equipped.bg ?? "studio_wall"
      },
      room: raw?.room ?? "bedroom",
      isSleeping: Boolean(raw?.isSleeping),
      updatedAt: Number(raw?.lastUpdated ?? Date.now())
    });
  }

  private sanitize(input: GameState): GameState {
    const next: GameState = {
      ...DEFAULT_STATE,
      ...input,
      stats: { ...DEFAULT_STATS, ...(input.stats ?? {}) },
      equipped: { ...DEFAULT_STATE.equipped, ...(input.equipped ?? {}) },
      itemCounts: { ...(input.itemCounts ?? {}) },
      inventory: Array.isArray(input.inventory) ? [...new Set(input.inventory)] : [...DEFAULT_STATE.inventory]
    };
    next.coins = Math.max(0, Math.floor(Number(next.coins) || 0));
    next.level = Math.max(1, Math.floor(Number(next.level) || 1));
    next.xp = Math.max(0, Math.floor(Number(next.xp) || 0));
    (Object.keys(next.stats) as StatKey[]).forEach((key) => (next.stats[key] = clamp100(Number(next.stats[key]) || 0)));
    return next;
  }

  private parse(raw: string | null): any {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}
