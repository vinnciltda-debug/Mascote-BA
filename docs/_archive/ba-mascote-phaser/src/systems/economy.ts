import type { ItemDefinition, PurchaseResult } from "../core/types";
import { GameStore } from "../core/state";

export class EconomySystem {
  constructor(private readonly store: GameStore) {}

  canAfford(item: ItemDefinition): boolean {
    return this.store.snapshot.coins >= item.price;
  }

  buy(itemId: string): PurchaseResult {
    return this.store.purchase(itemId);
  }
}
