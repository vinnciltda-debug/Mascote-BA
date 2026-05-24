import { GameStore } from "../core/state";

export class ProgressionSystem {
  constructor(private readonly store: GameStore) {}

  addXp(amount: number): void {
    this.store.addXp(amount);
  }

  addCoins(amount: number): void {
    this.store.addCoins(amount);
  }
}
