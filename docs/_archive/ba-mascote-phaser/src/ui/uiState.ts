import type { UIState, UIToast } from "../core/types";

export class UIStateStore {
  private state: UIState = {
    toasts: [],
    highlightItemId: null,
    blockedReason: null
  };

  private listeners = new Set<(state: UIState) => void>();

  subscribe(listener: (state: UIState) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  get snapshot(): UIState {
    return structuredClone(this.state);
  }

  setHighlight(itemId: string | null): void {
    this.state.highlightItemId = itemId;
    this.emit();
  }

  setBlocked(reason: string | null): void {
    this.state.blockedReason = reason;
    this.emit();
  }

  enqueue(text: string, kind: UIToast["kind"] = "info", ttlMs = 1800): UIToast {
    const toast: UIToast = { id: `${Date.now()}-${Math.random()}`, text, kind, ttlMs };
    this.state.toasts.push(toast);
    this.emit();
    return toast;
  }

  remove(id: string): void {
    this.state.toasts = this.state.toasts.filter((item) => item.id !== id);
    this.emit();
  }

  private emit(): void {
    const snap = this.snapshot;
    this.listeners.forEach((listener) => listener(snap));
  }
}
