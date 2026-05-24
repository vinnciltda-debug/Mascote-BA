import Phaser from "phaser";
import { AudioBus } from "../../audio/AudioBus";
import { ITEM_CATALOG } from "../../core/catalog";
import { GameStore } from "../../core/state";
import type { GameState, ItemCategory, ItemDefinition, ItemSlot } from "../../core/types";
import { BA_POU_THEME, rarityColor } from "../../ui/theme";
import { UIStateStore } from "../../ui/uiState";

type Mode = "closet" | "shop";

const CATEGORIES: Array<{ id: ItemCategory; label: string }> = [
  { id: "style", label: "Identidade" },
  { id: "closet", label: "Closet" },
  { id: "home", label: "Fundos" },
  { id: "cantina", label: "Cantina" },
  { id: "care", label: "Cuidados" }
];

const SLOT_LABEL: Partial<Record<ItemSlot, string>> = {
  bodyColor: "Corpo",
  stripeColor: "Listras",
  wingColor: "Asas",
  hat: "Cabeca",
  glasses: "Oculos",
  outfit: "Look",
  prop: "Objeto",
  bg: "Fundo"
};

export class MainScene extends Phaser.Scene {
  private readonly theme = BA_POU_THEME;
  private store!: GameStore;
  private uiState = new UIStateStore();
  private audio = new AudioBus();

  private mode: Mode = "closet";
  private activeCategory: ItemCategory = "style";
  private previewEquip: Partial<Record<ItemSlot, string | null>> = {};
  private compareSlot: ItemSlot | null = null;
  private compareFrom: string | null = null;
  private compareTo: string | null = null;

  private hudRoot!: Phaser.GameObjects.Container;
  private contentRoot!: Phaser.GameObjects.Container;
  private itemListRoot!: Phaser.GameObjects.Container;
  private tabsRoot!: Phaser.GameObjects.Container;
  private beeRoot!: Phaser.GameObjects.Container;
  private compareText!: Phaser.GameObjects.Text;

  constructor() {
    super("main");
  }

  create(): void {
    this.store = new GameStore();
    this.audio.arm();
    this.audio.startAmbient();
    this.cameras.main.setBackgroundColor(this.theme.background.mid);
    this.drawBackground();
    this.createLayout();
    this.bindStores();
    this.render();
  }

  private bindStores(): void {
    this.store.subscribe(() => this.render());
    this.uiState.subscribe((ui) => {
      if (!ui.toasts.length) return;
      const toast = ui.toasts[ui.toasts.length - 1];
      this.showToast(toast.text, toast.kind);
      window.setTimeout(() => this.uiState.remove(toast.id), toast.ttlMs);
    });
  }

  private drawBackground(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(this.theme.background.top, this.theme.background.top, this.theme.background.bottom, this.theme.background.mid, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);
    g.lineStyle(1, 0xffffff, 0.1);
    for (let x = 0; x < this.scale.width; x += 28) g.lineBetween(x, 0, x, this.scale.height);
  }

  private createLayout(): void {
    this.hudRoot = this.add.container(0, 0);
    this.contentRoot = this.add.container(0, 0);
    this.tabsRoot = this.add.container(12, 160);
    this.itemListRoot = this.add.container(12, 214);
    this.beeRoot = this.add.container(this.scale.width * 0.5, this.scale.height * 0.54);
    this.compareText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.25, "", {
      fontSize: "15px",
      color: this.theme.text.primary,
      fontStyle: "700"
    }).setOrigin(0.5, 0.5);

    this.createModeSwitch();
    this.createCategoryTabs();
  }

  private createModeSwitch(): void {
    const button = this.makeCard(12, 104, 138, 46, this.theme.card.base, 0.95, this.contentRoot);
    const label = this.add.text(81, 127, "Closet", { fontSize: "16px", color: this.theme.text.primary, fontStyle: "700" }).setOrigin(0.5);
    this.contentRoot.add(label);
    button.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      this.mode = this.mode === "closet" ? "shop" : "closet";
      label.setText(this.mode === "closet" ? "Closet" : "Loja");
      this.audio.playUI("tap");
      this.renderItems();
    });
  }

  private createCategoryTabs(): void {
    this.tabsRoot.removeAll(true);
    let x = 0;
    for (const category of CATEGORIES) {
      const active = category.id === this.activeCategory;
      const tab = this.makeCard(x, 0, 128, 44, active ? this.theme.state.active : this.theme.card.base, active ? 1 : 0.9, this.tabsRoot);
      const label = this.add.text(x + 64, 22, category.label, {
        fontSize: "14px",
        color: this.theme.text.primary,
        fontStyle: "700"
      }).setOrigin(0.5);
      this.tabsRoot.add(label);
      tab.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.activeCategory = category.id;
        this.audio.playUI("tap");
        this.createCategoryTabs();
        this.renderItems();
      });
      x += 134;
    }
  }

  private render(): void {
    this.renderHud();
    this.renderBee();
    this.renderItems();
    this.renderCompareLabel();
  }

  private renderHud(): void {
    this.hudRoot.removeAll(true);
    const state = this.store.snapshot;

    this.makeCard(12, 12, this.scale.width - 24, 82, this.theme.card.base, 0.92, this.hudRoot);
    this.makeBadge(24, 24, 148, 34, `Moedas ${state.coins}`, this.theme.state.active, this.hudRoot);
    this.makeBadge(this.scale.width - 110, 24, 86, 34, `Nv ${state.level}`, 0xffffff, this.hudRoot);

    const stats = [
      { k: "hunger", label: "Alim.", value: state.stats.hunger, color: 0xfb923c },
      { k: "health", label: "Saude", value: state.stats.health, color: 0x22c55e },
      { k: "fun", label: "Insp.", value: state.stats.fun, color: 0x3b82f6 },
      { k: "energy", label: "Ener.", value: state.stats.energy, color: 0xfacc15 },
      { k: "clean", label: "Limp.", value: state.stats.clean, color: 0x06b6d4 }
    ];

    let x = 184;
    for (const stat of stats) {
      this.makeStatPill(x, 24, 74, 56, stat.label, stat.value, stat.color, this.hudRoot);
      x += 78;
    }
  }

  private renderBee(): void {
    this.beeRoot.removeAll(true);
    const current = this.store.snapshot;

    const body = this.colorFrom(this.effectiveEquipped("bodyColor"), 0xf4c434);
    const stripes = this.colorFrom(this.effectiveEquipped("stripeColor"), 0x8b5831);
    const wings = this.colorFrom(this.effectiveEquipped("wingColor"), 0xb9eff6);
    const outfit = this.colorFrom(this.effectiveEquipped("outfit"), 0x2563eb);
    const hat = this.colorFrom(this.effectiveEquipped("hat"), 0x7c3aed);
    const prop = this.colorFrom(this.effectiveEquipped("prop"), 0x8b5831);
    const bgColor = this.colorFrom(this.effectiveEquipped("bg"), 0xcee9df);
    this.cameras.main.setBackgroundColor(bgColor);

    const shadow = this.add.ellipse(0, 150, 176, 34, 0x000000, 0.18);
    this.beeRoot.add(shadow);

    const bee = this.add.graphics();
    bee.fillStyle(wings, 0.88);
    bee.fillEllipse(-95, -6, 76, 118);
    bee.fillEllipse(95, -6, 76, 118);
    bee.fillStyle(body, 1);
    bee.fillEllipse(0, 0, 226, 250);
    bee.lineStyle(10, 0x2c241f, 1);
    bee.strokeEllipse(0, 0, 226, 250);
    bee.fillStyle(0xffffff, 0.17);
    bee.fillEllipse(0, -84, 150, 36);
    bee.lineStyle(18, stripes, 0.78);
    bee.strokeLineShape(new Phaser.Geom.Line(-74, 26, 74, 26));
    bee.strokeLineShape(new Phaser.Geom.Line(-60, 70, 60, 70));
    this.beeRoot.add(bee);

    const eyes = this.add.graphics();
    eyes.fillStyle(0xffffff, 1);
    eyes.fillCircle(-44, -36, 34);
    eyes.fillCircle(44, -36, 34);
    eyes.fillStyle(0x201a15, 1);
    eyes.fillCircle(-38, -30, 16);
    eyes.fillCircle(50, -30, 16);
    eyes.fillStyle(0xffffff, 0.95);
    eyes.fillCircle(-31, -39, 5);
    eyes.fillCircle(57, -39, 5);
    this.beeRoot.add(eyes);

    const mouth = this.add.arc(0, 24, 26, 20, 160, false, 0x201a15, 0);
    mouth.setStrokeStyle(5, 0x201a15, 1);
    this.beeRoot.add(mouth);

    if (this.effectiveEquipped("outfit")) {
      const suit = this.add.rectangle(0, 106, 134, 74, outfit, 0.96).setStrokeStyle(5, 0x2c241f, 1);
      this.beeRoot.add(suit);
    }
    if (this.effectiveEquipped("hat")) {
      const cap = this.add.ellipse(0, -133, 134, 46, hat, 1).setStrokeStyle(5, 0x2c241f, 1);
      this.beeRoot.add(cap);
    }
    if (this.effectiveEquipped("glasses")) {
      const gl = this.add.graphics();
      gl.lineStyle(5, 0x2c241f, 1);
      gl.strokeCircle(-44, -36, 25);
      gl.strokeCircle(44, -36, 25);
      gl.strokeLineShape(new Phaser.Geom.Line(-19, -36, 19, -36));
      this.beeRoot.add(gl);
    }
    if (this.effectiveEquipped("prop")) {
      const hand = this.add.rectangle(126, 52, 24, 94, prop, 1).setStrokeStyle(4, 0x2c241f, 1);
      hand.setRotation(Phaser.Math.DegToRad(26));
      this.beeRoot.add(hand);
    }

    this.tweens.killTweensOf(this.beeRoot);
    this.tweens.add({
      targets: this.beeRoot,
      y: this.scale.height * 0.54 - 7,
      duration: 1300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut"
    });

    void current;
  }

  private renderCompareLabel(): void {
    if (this.mode !== "closet" || !this.compareSlot || !this.compareTo) {
      this.compareText.setText("");
      return;
    }
    const from = this.itemName(this.compareFrom);
    const to = this.itemName(this.compareTo);
    this.compareText.setText(`Antes: ${from}   |   Depois: ${to}`);
  }

  private renderItems(): void {
    this.itemListRoot.removeAll(true);
    const state = this.store.snapshot;
    const list = ITEM_CATALOG.filter((item) => {
      if (item.category !== this.activeCategory) return false;
      if (this.mode === "shop") return true;
      return this.store.owns(item.id) || item.price === 0;
    });

    const header = this.add.text(0, 0, `${this.mode === "shop" ? "Loja" : "Closet"} • ${this.categoryLabel(this.activeCategory)}`, {
      fontSize: "17px",
      color: "#fffdf8",
      fontStyle: "700"
    });
    this.itemListRoot.add(header);

    let y = 34;
    for (const item of list) {
      const row = this.createItemRow(item, state, y);
      this.itemListRoot.add(row);
      y += 68;
    }
  }

  private createItemRow(item: ItemDefinition, state: GameState, y: number): Phaser.GameObjects.Container {
    const root = this.add.container(0, y);
    const owned = this.store.owns(item.id);
    const locked = this.store.isLocked(item);
    const equipped = state.equipped[item.slot] === item.id;
    const count = this.store.count(item.id);
    const rarity = rarityColor(item.visual.rarity);
    const cardColor = item.visual.frameStyle === "premium" ? 0xfffbeb : this.theme.card.base;

    const bg = this.makeCard(0, 0, this.scale.width - 24, 58, cardColor, 0.95, root);
    const rarityBar = this.add.rectangle(2, 4, 8, 50, rarity, 1).setOrigin(0, 0).setStrokeStyle(0, 0);
    const iconBack = this.add.rectangle(16, 10, 38, 38, this.colorFrom(item.id, 0xd4d4d8), 1).setOrigin(0, 0).setStrokeStyle(2, this.theme.card.stroke, 0.26);
    const label = this.add.text(62, 8, item.name, { fontSize: "15px", color: this.theme.text.primary, fontStyle: "700" });
    const sub = this.add.text(62, 30, this.itemSubLabel(item, owned, equipped, locked, count), { fontSize: "12px", color: this.theme.text.muted, fontStyle: "700" });
    const action = this.createActionChip(item, owned, locked, equipped);
    const price = this.add.text(this.scale.width - 180, 31, this.priceLabel(item, owned, locked, count), { fontSize: "12px", color: this.theme.text.muted, fontStyle: "700" });

    const badge = item.visual.badge && item.visual.badge !== "none" ? this.createBadgeForItem(item) : null;
    if (badge) root.add(badge);

    root.add([bg, rarityBar, iconBack, label, sub, price, action]);
    root.setSize(this.scale.width - 24, 58);
    root.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scale.width - 24, 58), Phaser.Geom.Rectangle.Contains);
    root.on("pointerover", () => this.previewItem(item));
    root.on("pointerout", () => this.clearPreview());
    root.on("pointerdown", () => this.activateItem(item));
    return root;
  }

  private createActionChip(item: ItemDefinition, owned: boolean, locked: boolean, equipped: boolean): Phaser.GameObjects.Container {
    const x = this.scale.width - 118;
    const y = 10;
    const text = this.mode === "shop"
      ? locked ? "Bloq." : owned && !item.consumable ? "Usar" : "Comprar"
      : equipped ? "Remover" : "Aplicar";
    const color = locked ? this.theme.state.locked : text === "Comprar" ? this.theme.state.active : this.theme.state.success;
    const chip = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 90, 38, color, 1).setOrigin(0, 0).setStrokeStyle(2, this.theme.card.stroke, 0.33);
    const label = this.add.text(45, 19, text, { fontSize: "13px", color: this.theme.text.primary, fontStyle: "700" }).setOrigin(0.5);
    chip.add([bg, label]);
    return chip;
  }

  private createBadgeForItem(item: ItemDefinition): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const text = item.visual.badge === "new" ? "NOVO" : item.visual.badge === "meta" ? "META" : "OK";
    const color = item.visual.badge === "new" ? 0xf43f5e : 0x2563eb;
    const bg = this.add.rectangle(this.scale.width - 208, 5, 52, 18, color, 1).setOrigin(0, 0).setStrokeStyle(2, this.theme.card.stroke, 0.28);
    const label = this.add.text(this.scale.width - 182, 14, text, { fontSize: "10px", color: this.theme.text.inverse, fontStyle: "700" }).setOrigin(0.5);
    c.add([bg, label]);
    return c;
  }

  private previewItem(item: ItemDefinition): void {
    this.previewEquip[item.slot] = item.id;
    this.compareSlot = item.slot;
    this.compareFrom = this.store.snapshot.equipped[item.slot] ?? null;
    this.compareTo = item.id;
    this.uiState.setHighlight(item.id);
    this.renderBee();
    this.renderCompareLabel();
  }

  private clearPreview(): void {
    this.previewEquip = {};
    this.compareSlot = null;
    this.compareFrom = null;
    this.compareTo = null;
    this.uiState.setHighlight(null);
    this.renderBee();
    this.renderCompareLabel();
  }

  private activateItem(item: ItemDefinition): void {
    this.audio.arm();
    const conflict = this.validateConflict(item);
    if (conflict) {
      this.audio.playUI("warn");
      this.uiState.enqueue(conflict, "warning");
      this.uiState.setBlocked(conflict);
      return;
    }
    this.uiState.setBlocked(null);

    if (this.mode === "shop") {
      const result = this.store.purchase(item.id);
      if (!result.ok) {
        this.audio.playUI("warn");
        this.uiState.enqueue(
          result.reason === "coins" ? "Moedas insuficientes." :
          result.reason === "locked" ? "Item bloqueado por nivel." :
          result.reason === "already_owned" ? "Item ja possuido." :
          "Nao foi possivel comprar.",
          "warning"
        );
        return;
      }
      this.audio.playAction("buy");
      this.uiState.enqueue(item.consumable ? `${item.name} enviado ao estoque.` : `${item.name} comprado e equipado.`, "success");
      return;
    }

    if (item.consumable) {
      const okConsume = this.store.consume(item.id);
      if (okConsume) {
        this.audio.playAction("equip");
        this.uiState.enqueue(`${item.name} usado.`, "success");
      } else {
        this.audio.playUI("warn");
        this.uiState.enqueue("Item sem estoque.", "warning");
      }
      return;
    }

    const ok = this.store.equip(item.id);
    if (ok) {
      this.audio.playAction("equip");
      this.uiState.enqueue(`${item.name} aplicado.`, "success");
    } else {
      this.audio.playUI("warn");
      this.uiState.enqueue("Nao foi possivel aplicar.", "warning");
    }
  }

  private validateConflict(item: ItemDefinition): string | null {
    const equipped = this.store.snapshot.equipped;
    const isHeadset = item.tags.some((tag) => tag.includes("headset"));
    if (item.slot === "hat" && isHeadset && equipped.glasses) {
      return "Esse headset conflita com oculos equipados.";
    }
    return null;
  }

  private showToast(text: string, kind: "info" | "success" | "warning"): void {
    const color = kind === "success" ? this.theme.state.success : kind === "warning" ? this.theme.state.warning : 0x334155;
    const width = Math.min(this.scale.width - 48, 420);
    const x = (this.scale.width - width) / 2;
    const y = this.scale.height - 116;
    const box = this.add.rectangle(x, y, width, 46, color, 0.93).setOrigin(0, 0).setStrokeStyle(2, this.theme.card.stroke, 0.34);
    const label = this.add.text(this.scale.width / 2, y + 23, text, { fontSize: "14px", color: this.theme.text.inverse, fontStyle: "700" }).setOrigin(0.5);
    this.tweens.add({
      targets: [box, label],
      alpha: 0,
      delay: 1300,
      duration: 340,
      onComplete: () => {
        box.destroy();
        label.destroy();
      }
    });
  }

  private makeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: number,
    alpha: number,
    parent?: Phaser.GameObjects.Container
  ): Phaser.GameObjects.Rectangle {
    const shadow = this.add.rectangle(x + 2, y + 4, width, height, this.theme.card.shadow, 0.11).setOrigin(0, 0);
    const rect = this.add.rectangle(x, y, width, height, fill, alpha).setOrigin(0, 0);
    rect.setStrokeStyle(2, this.theme.card.stroke, 0.35);
    if (parent) parent.add([shadow, rect]);
    void shadow;
    return rect;
  }

  private makeBadge(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    fill: number,
    parent?: Phaser.GameObjects.Container
  ): void {
    this.makeCard(x, y, width, height, fill, 0.95, parent);
    const label = this.add.text(x + width / 2, y + height / 2, text, { fontSize: "16px", color: this.theme.text.primary, fontStyle: "700" }).setOrigin(0.5);
    if (parent) parent.add(label);
  }

  private makeStatPill(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: number,
    fill: number,
    parent?: Phaser.GameObjects.Container
  ): void {
    this.makeCard(x, y, width, height, 0xffffff, 0.88, parent);
    const h = Phaser.Math.Clamp((value / 100) * (height - 20), 3, height - 20);
    const bar = this.add.rectangle(x + width - 12, y + height - 6 - h / 2, 8, h, fill, 0.95).setOrigin(0.5);
    const t1 = this.add.text(x + 8, y + 12, label, { fontSize: "11px", color: this.theme.text.muted, fontStyle: "700" });
    const t2 = this.add.text(x + 8, y + 30, `${Math.round(value)}`, { fontSize: "13px", color: this.theme.text.primary, fontStyle: "700" });
    if (parent) parent.add([bar, t1, t2]);
  }

  private effectiveEquipped(slot: ItemSlot): string | null {
    if (slot in this.previewEquip) return this.previewEquip[slot] ?? null;
    return this.store.snapshot.equipped[slot] ?? null;
  }

  private itemSubLabel(item: ItemDefinition, owned: boolean, equipped: boolean, locked: boolean, count: number): string {
    if (locked) return `Bloqueado • Nv ${item.unlockRule.minLevel ?? 1}`;
    if (this.mode === "closet") {
      if (item.consumable) return count > 0 ? `Estoque ${count}` : "Sem estoque";
      return equipped ? `Em uso • ${SLOT_LABEL[item.slot] ?? item.slot}` : `Categoria ${SLOT_LABEL[item.slot] ?? item.slot}`;
    }
    if (item.consumable) return count > 0 ? `Consumivel • estoque ${count}` : "Consumivel";
    if (equipped) return "Equipado";
    if (owned) return "Ja possuido";
    return "Disponivel para compra";
  }

  private priceLabel(item: ItemDefinition, owned: boolean, locked: boolean, count: number): string {
    if (locked) return "Bloqueado";
    if (item.consumable && count > 0 && this.mode === "closet") return `x${count}`;
    if (!item.consumable && owned && this.mode === "shop") return "Colecao";
    return `${item.price} moedas`;
  }

  private colorFrom(itemId: string | null, fallback: number): number {
    if (!itemId) return fallback;
    const item = ITEM_CATALOG.find((entry) => entry.id === itemId);
    const accent = item?.renderProfile.accent || item?.preview.accent;
    if (!accent?.startsWith("#")) return fallback;
    return Number.parseInt(accent.slice(1), 16);
  }

  private itemName(itemId: string | null): string {
    if (!itemId) return "Sem item";
    return ITEM_CATALOG.find((item) => item.id === itemId)?.name ?? "Item";
  }

  private categoryLabel(category: ItemCategory): string {
    return CATEGORIES.find((entry) => entry.id === category)?.label ?? category;
  }
}
