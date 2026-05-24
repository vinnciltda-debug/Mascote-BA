class App {
    constructor() {
        this.rooms = [
            { id: "bedroom", name: "ESTUDIO", className: "bg-bedroom", propLeft: "prop-easel", propRight: "prop-palette" },
            { id: "kitchen", name: "CAFE", className: "bg-kitchen", propLeft: "prop-canteen", propRight: "prop-cups" },
            { id: "bathroom", name: "LAVABO", className: "bg-bathroom", propLeft: "prop-bubbles", propRight: "prop-bath-shelf" },
            { id: "laboratory", name: "LAB", className: "bg-laboratory", propLeft: "prop-flasks", propRight: "prop-restauro" },
            { id: "game-room", name: "GALERIA", className: "bg-game-room", propLeft: "prop-gallery-frames", propRight: "prop-plaster" }
        ];
        this.currentRoomIndex = Math.max(0, this.rooms.findIndex(room => room.id === State.state.room));
        this.inventoryIndex = 0;
        this.isDragging = false;
        this.dragEl = null;
        this.activeItemData = null;

        this.mascotContainer = document.getElementById("mascot-container");
        this.nightOverlay = document.getElementById("night-overlay");
        this.bottomLeft = document.getElementById("bottom-left");
        this.bottomCenter = document.getElementById("bottom-center");
        this.bottomRight = document.getElementById("bottom-right");
        this.closetModal = document.getElementById("closet-modal");
        this.closetGrid = document.getElementById("closet-items");
        this.closetCategories = document.getElementById("closet-categories");
        this.closetTitle = document.getElementById("closet-title");
        this.closetCategoriesData = [
            { id: "bodyColor", name: "Cor", icon: "color", note: "base do mascote" },
            { id: "stripeColor", name: "Listras", icon: "stripes", note: "contraste do corpo" },
            { id: "wingColor", name: "Asas", icon: "wings", note: "acabamento das asas" },
            { id: "marking", name: "Marcas", icon: "badge", note: "grafismos do corpo" },
            { id: "antenna", name: "Antenas", icon: "sparkle", note: "pontas e sinais" },
            { id: "cheeks", name: "Rosto", icon: "color", note: "bochechas e adesivos" },
            { id: "aura", name: "Aura", icon: "sparkle", note: "efeitos ao redor" },
            { id: "badge", name: "Emblema", icon: "badge", note: "pins no corpo" },
            { id: "eyes", name: "Olhar", icon: "eyes", note: "expressao principal" },
            { id: "mouth", name: "Boca", icon: "mouth", note: "humor da abelha" },
            { id: "hat", name: "Cabeça", icon: "beret", note: "acessórios superiores" },
            { id: "glasses", name: "Óculos", icon: "glasses", note: "camada do rosto" },
            { id: "outfit", name: "Look", icon: "uniform", note: "uniformes e cursos" },
            { id: "prop", name: "Objeto", icon: "brush", note: "item de cena" },
            { id: "bg", name: "Fundo", icon: "gallery", note: "ambiente da cena" }
        ];
        this.closetFilter = "all";

        this.mascot = new MascotRender("mascot-container");
        this.shop = new ShopLogic();
        this.minigame = new MinigameInstance();
        this.init();
    }

    init() {
        document.addEventListener("pointerdown", () => Utils.audio.arm(), { once: true });
        document.getElementById("coin-icon").innerHTML = Utils.icon("coin");
        document.querySelectorAll(".stat-icon[data-icon]").forEach(icon => {
            icon.innerHTML = Utils.icon(icon.dataset.icon);
        });
        document.getElementById("prev-room").onclick = () => this.changeRoom(-1);
        document.getElementById("next-room").onclick = () => this.changeRoom(1);
        document.getElementById("close-closet").onclick = () => this.hideCloset();
        document.getElementById("back-closet").onclick = () => this.renderClosetCategories();
        document.getElementById("daily-sketch-btn").onclick = () => State.claimDailySketch();

        this.mascotContainer.addEventListener("click", event => this.petMascot(event));
        document.addEventListener("mousemove", event => this.handleGlobalMove(event));
        document.addEventListener("touchmove", event => this.handleGlobalMove(event), { passive: false });
        document.addEventListener("mouseup", () => this.handleGlobalEnd());
        document.addEventListener("touchend", () => this.handleGlobalEnd());
        window.addEventListener("resize", () => this.renderFooter());

        State.subscribe(() => {
            this.updateNightOverlay();
            this.updateSceneBackground();
            if (!this.closetModal.classList.contains("hidden") && !this.closetGrid.classList.contains("hidden")) {
                this.renderClosetItems(this.activeClosetSlot, this.activeClosetName);
            }
        });

        this.updateRoomUI();
        State.updateUI();
    }

    get room() {
        return this.rooms[this.currentRoomIndex] || this.rooms[0];
    }

    changeRoom(direction) {
        Utils.audio.play("open");
        this.currentRoomIndex = (this.currentRoomIndex + direction + this.rooms.length) % this.rooms.length;
        this.inventoryIndex = 0;
        State.state.room = this.room.id;
        if (State.state.isSleeping && this.room.id !== "bedroom") State.toggleSleep();
        State.save();
        this.updateRoomUI();
    }

    updateRoomUI() {
        const app = document.getElementById("app");
        this.rooms.forEach(room => app.classList.remove(room.className));
        app.classList.add(this.room.className);
        document.getElementById("room-name").textContent = this.room.name;

        const left = document.getElementById("room-prop-left");
        const right = document.getElementById("room-prop-right");
        left.className = `room-prop prop-left ${this.room.propLeft}`;
        right.className = `room-prop prop-right ${this.room.propRight}`;
        this.updateSceneBackground();
        this.renderFooter();
        this.updateNightOverlay();
    }

    updateSceneBackground() {
        const scene = document.getElementById("scene-card");
        SHOP_ITEMS.filter(item => item.slot === "bg").forEach(item => scene.classList.remove(`bg-${item.id}`));
        scene.classList.add(`bg-${State.state.equipped.bg || "studio_wall"}`);
    }

    updateNightOverlay() {
        this.nightOverlay.classList.toggle("hidden", !(State.state.isSleeping && this.room.id === "bedroom"));
    }

    petMascot(event) {
        if (State.state.isSleeping) {
            Utils.showToast("A abelha esta dormindo no ateliê.");
            return;
        }
        Utils.audio.play("success");
        State.changeStats({ fun: 4, health: 0.6 });
        State.addXp(2);
        this.playMascotTapEffect(event);
    }

    playMascotTapEffect(event) {
        const rect = this.mascotContainer.getBoundingClientRect();
        const fallbackX = rect.width * 0.5;
        const fallbackY = rect.height * 0.42;
        const x = event ? Utils.clamp(event.clientX - rect.left, 32, rect.width - 32) : fallbackX;
        const y = event ? Utils.clamp(event.clientY - rect.top, 26, rect.height - 26) : fallbackY;

        const hearts = 2 + (Math.random() < 0.35 ? 1 : 0);
        for (let i = 0; i < hearts; i++) {
            const startX = x + (Math.random() * 14 - 7);
            const startY = y + (Math.random() * 8 - 4);
            const driftX = Math.random() * 16 - 8;
            const driftY = -(18 + Math.random() * 12);
            this.spawnTapEffectNode("tap-heart", startX, startY, { dx: driftX, dy: driftY });
        }
    }

    spawnTapEffectNode(className, x, y, options = {}) {
        const node = document.createElement("span");
        node.className = `tap-effect ${className}`;
        if (className === "tap-heart") node.innerHTML = "&#10084;";
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.setProperty("--tap-rot", `${Math.round(Math.random() * 80 - 40)}deg`);
        node.style.setProperty("--tap-dx", `${Math.round(options.dx || 0)}px`);
        node.style.setProperty("--tap-dy", `${Math.round(options.dy || 0)}px`);
        this.mascotContainer.appendChild(node);
        node.addEventListener("animationend", () => node.remove(), { once: true });
    }

    createActionButton(icon, label, callback) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "action-btn";
        button.innerHTML = `<span class="action-icon">${Utils.icon(icon)}</span><span class="action-label">${label}</span>`;
        button.onclick = () => {
            Utils.audio.play("tap");
            callback();
        };
        return button;
    }

    renderFooter() {
        this.bottomLeft.innerHTML = "";
        this.bottomCenter.innerHTML = "";
        this.bottomRight.innerHTML = "";
        this.bottomCenter.appendChild(this.createCenterPlaceholder());

        if (this.room.id === "bedroom") {
            this.bottomLeft.appendChild(this.createActionButton("closet", "Estilo", () => this.showCloset()));
            this.bottomCenter.innerHTML = "";
            this.bottomCenter.appendChild(this.createActionButton(State.state.isSleeping ? "wake" : "sleep", State.state.isSleeping ? "Acordar" : "Descanso", () => {
                const sleeping = State.toggleSleep();
                Utils.audio.play(sleeping ? "sleep" : "wake");
                Utils.showToast(sleeping ? "Modo descanso ativado." : "A abelha acordou.");
                this.renderFooter();
            }));
        }

        if (this.room.id === "kitchen") {
            this.bottomLeft.appendChild(this.createActionButton("canteen", "Café", () => this.shop.openItems("cantina")));
            this.renderInventoryScroller();
        }

        if (this.room.id === "bathroom") {
            const shower = this.createActionButton("bath", "Lavar", () => this.applyShowerEffect());
            this.bottomLeft.appendChild(shower);
            this.setupToolDrag(shower.querySelector(".action-icon"), "shower", "bath");
            this.renderInventoryScroller();
        }

        if (this.room.id === "laboratory") {
            this.bottomLeft.appendChild(this.createActionButton("care", "Cuidar", () => this.shop.openItems("care")));
            this.renderInventoryScroller();
        }

        if (this.room.id === "game-room") {
            this.bottomLeft.appendChild(this.createActionButton("game", "Jogos", () => this.minigame.start()));
            this.bottomCenter.innerHTML = "";
            this.bottomCenter.appendChild(this.createActionButton("ball", "Forma", () => {
                State.changeStats({ fun: 12, energy: -4 });
                State.addXp(5);
                Utils.showToast("Estudo rápido: inspiração subiu.");
            }));
        }

        this.bottomRight.appendChild(this.createActionButton("shop", "Loja", () => this.shop.show()));
    }

    createCenterPlaceholder() {
        const placeholder = document.createElement("div");
        placeholder.className = "inventory-scroller inventory-placeholder";
        placeholder.innerHTML = `<div class="current-item-display"><div class="main-item-icon">${Utils.icon("sparkle")}</div><span class="action-label">${this.placeholderLabel()}</span></div>`;
        return placeholder;
    }

    placeholderLabel() {
        if (this.room.id === "kitchen") return "Cardápio";
        if (this.room.id === "bathroom") return "Higiene";
        if (this.room.id === "laboratory") return "Cuidados";
        if (this.room.id === "game-room") return "Brincar";
        return "Ambiente";
    }

    getInventoryItems() {
        const inventory = State.state.inventory;
        return SHOP_ITEMS.filter(item => {
            if (!inventory.includes(item.id)) return false;
            if (this.room.id === "kitchen") return item.slot === "food";
            if (this.room.id === "laboratory") return item.slot === "potion";
            if (this.room.id === "bathroom") return item.id === "soap";
            return false;
        });
    }

    refreshRoomInventory() {
        if (["kitchen", "bathroom", "laboratory"].includes(this.room.id)) {
            this.renderInventoryScroller();
        }
    }

    onItemPurchased(item) {
        const items = this.getInventoryItems();
        const index = items.findIndex(entry => entry.id === item.id);
        if (index >= 0) this.inventoryIndex = index;
        this.refreshRoomInventory();
    }

    renderInventoryScroller() {
        const items = this.getInventoryItems();
        this.bottomCenter.innerHTML = "";
        const scroller = document.createElement("div");
        scroller.className = "inventory-scroller";

        const isFixedBathroom = this.room.id === "bathroom";
        const prevBtn = document.createElement("button");
        prevBtn.type = "button";
        prevBtn.className = "nav-arrow-small";
        prevBtn.textContent = "<";
        prevBtn.onclick = () => this.changeInventory(-1);

        const nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.className = "nav-arrow-small";
        nextBtn.textContent = ">";
        nextBtn.onclick = () => this.changeInventory(1);

        const display = document.createElement("div");
        display.className = "current-item-display";

        if (items.length === 0) {
            display.innerHTML = `<div class="main-item-icon">${Utils.icon("question")}</div><span class="action-label">Sem item</span>`;
        } else {
            this.inventoryIndex = Utils.clamp(this.inventoryIndex, 0, items.length - 1);
            const item = items[this.inventoryIndex];
            const count = State.getItemCount(item.id);
            const countBadge = item.consumable && count > 0 ? `<span class="item-count-badge">${count}</span>` : "";
            display.innerHTML = `<div class="main-item-icon">${Utils.icon(item.icon, { accent: item.color || "var(--honey)" })}${countBadge}</div><span class="action-label">${item.name}</span>`;
            this.setupToolDrag(display.querySelector(".main-item-icon"), item.id, item.icon, item);
        }

        if (isFixedBathroom) scroller.classList.add("inventory-fixed");
        if (!isFixedBathroom && items.length < 2) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
        }
        if (isFixedBathroom) scroller.append(display);
        else scroller.append(prevBtn, display, nextBtn);
        this.bottomCenter.appendChild(scroller);
    }

    changeInventory(direction) {
        const items = this.getInventoryItems();
        if (!items.length) return;
        this.inventoryIndex = (this.inventoryIndex + direction + items.length) % items.length;
        this.renderInventoryScroller();
    }

    setupToolDrag(element, type, icon, data = null) {
        if (!element) return;
        const start = event => {
            if (this.isDragging || State.state.isSleeping) return;
            this.isDragging = true;
            this.activeItemData = { type, icon, data };
            this.dragEl = document.createElement("div");
            this.dragEl.className = "dragging";
            this.dragEl.innerHTML = Utils.icon(icon);
            document.body.appendChild(this.dragEl);
            this.updateDragPos(event);
        };
        element.onmousedown = start;
        element.ontouchstart = event => {
            start(event);
            event.preventDefault();
        };
    }

    handleGlobalMove(event) {
        if (!this.isDragging || !this.dragEl) return;
        if (event.type === "touchmove") event.preventDefault();
        this.updateDragPos(event);
    }

    updateDragPos(event) {
        const { x, y } = this.pointer(event);
        this.dragEl.style.left = `${x}px`;
        this.dragEl.style.top = `${y}px`;
    }

    pointer(event) {
        const point = event.touches ? event.touches[0] : event;
        return { x: point.clientX, y: point.clientY };
    }

    handleGlobalEnd() {
        if (!this.isDragging || !this.dragEl) return;
        const dragRect = this.dragEl.getBoundingClientRect();
        const targetRect = this.mascotContainer.getBoundingClientRect();
        const hit = dragRect.left < targetRect.right && dragRect.right > targetRect.left &&
            dragRect.top < targetRect.bottom && dragRect.bottom > targetRect.top;

        if (hit) {
            if (this.activeItemData.type === "shower") this.applyShowerEffect();
            else if (this.activeItemData.data) this.applyItemEffect(this.activeItemData.data);
        }

        this.dragEl.remove();
        this.dragEl = null;
        this.isDragging = false;
        this.activeItemData = null;
    }

    applyItemEffect(item) {
        if (item.slot === "food") {
            const energyGain = item.type === "energy_food" ? (item.energyValue || 14) : 0;
            Utils.audio.play("success");
            State.changeStats({ hunger: item.value || 15, health: 1.5, clean: -1, energy: energyGain });
            State.consumeItem(item.id);
            State.addXp(6);
        }
        if (item.slot === "potion") {
            Utils.audio.play("success");
            const changes = {};
            if (item.type === "drain_all") {
                const drain = -(item.value || 18);
                changes.hunger = drain;
                changes.health = drain;
                changes.fun = drain;
                changes.energy = drain;
                changes.clean = drain;
            } else {
                changes[item.type === "fun" ? "fun" : item.type] = item.value || 20;
            }
            State.changeStats(changes);
            State.consumeItem(item.id);
            State.addXp(8);
            Utils.showToast(`${item.name} aplicado.`);
        }
        if (item.id === "soap") {
            Utils.audio.play("success");
            State.changeStats({ clean: 12, health: 1 });
            State.addXp(2);
            Utils.showToast("Limpeza em dia.");
        }
        const items = this.getInventoryItems();
        this.inventoryIndex = Utils.clamp(this.inventoryIndex, 0, Math.max(0, items.length - 1));
        this.renderInventoryScroller();
    }

    applyShowerEffect() {
        if (State.state.isSleeping) return;
        Utils.audio.play("success");
        State.changeStats({ clean: 28, health: 2, energy: -2 });
        State.addXp(4);
    }

    showCloset() {
        this.closetModal.classList.remove("hidden");
        Utils.audio.play("open");
        Utils.animate(this.closetModal, { opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "scale(1)" }, { duration: 180 });
        this.renderClosetCategories();
    }

    hideCloset() {
        Utils.animate(this.closetModal, { opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.96)" }, {
            duration: 150,
            onFinish: () => this.closetModal.classList.add("hidden")
        });
    }

    renderClosetCategories() {
        this.closetCategories.classList.remove("hidden");
        this.closetGrid.classList.add("hidden");
        this.closetGrid.classList.remove("closet-items-view");
        document.getElementById("back-closet").classList.add("hidden");
        this.closetTitle.textContent = "Estilo";
        this.closetCategories.innerHTML = "";
        this.closetFilter = "all";

        this.closetCategoriesData.forEach(category => {
            const allItems = SHOP_ITEMS.filter(item => item.slot === category.id);
            const ownedCount = allItems.filter(item => State.state.inventory.includes(item.id) || item.price === 0).length;
            const missingCount = Math.max(0, allItems.length - ownedCount);
            const card = document.createElement("button");
            card.type = "button";
            card.className = "category-card";
            card.innerHTML = `
                <div class="category-icon">${Utils.icon(category.icon)}</div>
                <div>
                    <div class="category-name">${category.name}</div>
                    <span class="category-note">${ownedCount}/${allItems.length} na coleção</span>
                </div>
                <strong>${missingCount > 0 ? `+${missingCount}` : "OK"}</strong>
            `;
            card.onclick = () => this.renderClosetItems(category.id, category.name);
            this.closetCategories.appendChild(card);
        });
    }

    ownedClosetItems(slot) {
        return SHOP_ITEMS
            .filter(item => item.slot === slot && (State.state.inventory.includes(item.id) || item.price === 0))
            .sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    createClosetQuickTabs(activeSlot) {
        const tabs = document.createElement("div");
        tabs.className = "closet-quick-tabs";
        this.closetCategoriesData.forEach(category => {
            const amount = this.ownedClosetItems(category.id).length;
            const button = document.createElement("button");
            button.type = "button";
            button.className = category.id === activeSlot ? "active" : "";
            button.innerHTML = `
                <span class="closet-tab-icon">${Utils.icon(category.icon)}</span>
                <span class="closet-tab-label">${category.name}</span>
                <small>${amount}</small>
            `;
            button.onclick = () => {
                if (category.id === activeSlot) return;
                Utils.audio.play("tap");
                this.renderClosetItems(category.id, category.name);
            };
            tabs.appendChild(button);
        });
        return tabs;
    }

    createClosetSummary(slot, items) {
        const summary = document.createElement("div");
        summary.className = "closet-summary";
        const equippedId = State.state.equipped[slot];
        const equippedItem = items.find(item => item.id === equippedId) || SHOP_ITEMS.find(item => item.id === equippedId);
        const equippedText = equippedItem ? equippedItem.name : "Nenhum item";
        summary.innerHTML = `
            <div class="closet-summary-main">
                <strong>${this.activeClosetName}</strong>
                <span>${items.length} item${items.length === 1 ? "" : "s"} na coleção</span>
            </div>
            <div class="closet-summary-active">
                <small>Em uso</small>
                <strong>${equippedText}</strong>
            </div>
        `;
        return summary;
    }

    closetThemeForItem(item) {
        const text = `${item?.id || ""} ${item?.name || ""} ${item?.note || ""}`.toLowerCase();
        if (text.includes("jornal") || text.includes("report") || text.includes("pauta") || text.includes("radio") || text.includes("podcast")) {
            return { label: "Jornalismo", className: "theme-journalism" };
        }
        if (text.includes("econom") || text.includes("dados") || text.includes("graf")) {
            return { label: "Economia", className: "theme-economy" };
        }
        if (text.includes("design") || text.includes("grid") || text.includes("layout") || text.includes("mockup")) {
            return { label: "Design", className: "theme-design" };
        }
        if (text.includes("pp") || text.includes("agencia") || text.includes("campanha") || text.includes("briefing") || text.includes("pitch")) {
            return { label: "Publicidade", className: "theme-pp" };
        }
        return { label: "Belas Artes", className: "theme-ba" };
    }

    renderClosetItems(slot, name) {
        this.activeClosetSlot = slot;
        this.activeClosetName = name;
        this.closetCategories.classList.add("hidden");
        this.closetGrid.classList.remove("hidden");
        this.closetGrid.classList.add("closet-items-view");
        document.getElementById("back-closet").classList.remove("hidden");
        this.closetTitle.textContent = name;
        this.closetGrid.innerHTML = "";

        const items = this.ownedClosetItems(slot);
        this.closetGrid.appendChild(this.createClosetQuickTabs(slot));
        this.closetGrid.appendChild(this.createClosetSummary(slot, items));
        if (!items.length) {
            const empty = document.createElement("div");
            empty.className = "category-card";
            empty.innerHTML = `<div class="category-icon">${Utils.icon("question")}</div><div><div class="category-name">Sem itens</div><span class="category-note">Compre opções no acervo.</span></div>`;
            this.closetGrid.appendChild(empty);
            return;
        }

        items.forEach(item => {
            const equipped = State.state.equipped[item.slot] === item.id;
            const theme = this.closetThemeForItem(item);
            const row = document.createElement("div");
            row.className = "shop-row-pou item-card";
            const actionLabel = equipped ? "Aplicado" : "Usar";
            const actionClass = equipped ? "equipped" : "use";
            const priceLine = equipped ? "em uso" : "toque para aplicar";
            row.innerHTML = `
                <div class="item-preview" style="${item.color ? `background:${item.color}` : ""}">${Utils.icon(item.icon, { accent: item.color || "var(--honey)" })}</div>
                <div class="item-panel">
                    <div class="row-info">
                        <strong>${item.name}</strong>
                        <span class="item-theme ${theme.className}">${theme.label}</span>
                        <span>${equipped ? "está em uso agora" : item.note || "item da coleção"}</span>
                    </div>
                    <div class="item-meta">
                        <div class="price-line">${priceLine}</div>
                        <button class="item-action ${actionClass}" type="button">${actionLabel}</button>
                    </div>
                </div>
            `;
            const equip = () => {
                State.equipItem(item.slot, item.id);
                Utils.audio.play("equip");
                this.renderClosetItems(slot, name);
            };
            row.querySelector("button").onclick = equip;
            row.onclick = event => {
                if (event.target.closest("button")) return;
                equip();
            };
            this.closetGrid.appendChild(row);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.Application = new App();
});

