export type StatKey = "hunger" | "health" | "fun" | "energy" | "clean";
export type ItemSlot =
  | "bodyColor"
  | "stripeColor"
  | "wingColor"
  | "marking"
  | "antenna"
  | "cheeks"
  | "aura"
  | "badge"
  | "eyes"
  | "mouth"
  | "hat"
  | "glasses"
  | "outfit"
  | "prop"
  | "bg"
  | "food"
  | "potion"
  | "utility"
  | "toy";

export type ItemCategory = "style" | "closet" | "home" | "care" | "cantina" | "games";
export type ItemRarity = "common" | "rare" | "epic";

export interface UnlockRule {
  minLevel?: number;
}

export interface ItemPreview {
  icon: string;
  accent?: string;
}

export interface ItemVisualMeta {
  rarity: ItemRarity;
  badge?: "new" | "meta" | "equipped" | "none";
  frameStyle?: "soft" | "bold" | "premium";
  previewVariant?: "flat" | "shine" | "paper";
}

export interface RenderProfile {
  family: "color" | "hat" | "glasses" | "outfit" | "prop" | "marking" | "aura" | "badge" | "face" | "room";
  accent?: string;
}

export interface ItemDefinition {
  id: string;
  name: string;
  slot: ItemSlot;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number;
  consumable?: boolean;
  tags: string[];
  unlockRule: UnlockRule;
  preview: ItemPreview;
  visual: ItemVisualMeta;
  renderProfile: RenderProfile;
  value?: number;
  effect?: Partial<Record<StatKey, number>>;
}

export interface GameState {
  version: number;
  coins: number;
  level: number;
  xp: number;
  stats: Record<StatKey, number>;
  inventory: string[];
  itemCounts: Record<string, number>;
  equipped: Partial<Record<ItemSlot, string | null>>;
  room: string;
  isSleeping: boolean;
  updatedAt: number;
}

export interface PurchaseResult {
  ok: boolean;
  reason?: "locked" | "coins" | "invalid" | "already_owned";
}

export interface VisualTheme {
  background: {
    top: number;
    mid: number;
    bottom: number;
  };
  card: {
    base: number;
    stroke: number;
    shadow: number;
  };
  text: {
    primary: string;
    muted: string;
    inverse: string;
  };
  state: {
    active: number;
    warning: number;
    locked: number;
    success: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
}

export interface UIToast {
  id: string;
  text: string;
  kind: "info" | "success" | "warning";
  ttlMs: number;
}

export interface UIState {
  toasts: UIToast[];
  highlightItemId: string | null;
  blockedReason: string | null;
}

export interface AudioBusConfig {
  master: number;
  ui: number;
  action: number;
  ambient: number;
}

export interface AssetPackRef {
  id: string;
  label: string;
  license: "CC0" | "OpenSource";
  sourceUrl: string;
  notes: string;
}

export interface AssetRegistry {
  packs: AssetPackRef[];
}
