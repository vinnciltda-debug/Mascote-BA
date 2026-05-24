import type { ItemDefinition, ItemSlot } from "./types";

const VALID_SLOTS: ItemSlot[] = [
  "bodyColor", "stripeColor", "wingColor", "marking", "antenna", "cheeks", "aura", "badge",
  "eyes", "mouth", "hat", "glasses", "outfit", "prop", "bg", "food", "potion", "utility", "toy"
];

export function validateCatalog(items: ItemDefinition[]): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id) throw new Error("Item sem id");
    if (ids.has(item.id)) throw new Error(`Item duplicado: ${item.id}`);
    ids.add(item.id);
    if (!VALID_SLOTS.includes(item.slot)) throw new Error(`Slot invalido: ${item.id}`);
    if (!item.preview?.icon) throw new Error(`Item sem preview: ${item.id}`);
    if (!item.visual?.rarity) throw new Error(`Item sem visual.rarity: ${item.id}`);
    if (!item.visual?.frameStyle) throw new Error(`Item sem visual.frameStyle: ${item.id}`);
    if (item.price < 0) throw new Error(`Preco invalido: ${item.id}`);
    if (!item.unlockRule) throw new Error(`Item sem unlockRule: ${item.id}`);
  }
}
