class UIStateStore {
    constructor() {
        this.state = { toasts: [], highlightItemId: null, blockedReason: null };
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        listener(this.snapshot());
        return () => this.listeners.delete(listener);
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    emit() {
        const snap = this.snapshot();
        this.listeners.forEach(listener => listener(snap));
    }

    setHighlight(itemId) {
        this.state.highlightItemId = itemId || null;
        this.emit();
    }

    setBlocked(reason) {
        this.state.blockedReason = reason || null;
        this.emit();
    }

    pushToast(text, kind = "info", ttlMs = 1800) {
        const id = `${Date.now()}-${Math.random()}`;
        this.state.toasts.push({ id, text, kind, ttlMs });
        this.emit();
        return id;
    }

    removeToast(id) {
        this.state.toasts = this.state.toasts.filter(toast => toast.id !== id);
        this.emit();
    }
}

window.UIState = new UIStateStore();
