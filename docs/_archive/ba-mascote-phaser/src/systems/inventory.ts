import { GameStore } from "../core/state";

export class InventorySystem {
  constructor(private readonly store: GameStore) {}

  equip(itemId: string): boolean {
    return this.store.equip(itemId);
  }

  consume(itemId: string): boolean {
    return this.store.consume(itemId);
  }

  count(itemId: string): number {
    return this.store.count(itemId);
  }
}
