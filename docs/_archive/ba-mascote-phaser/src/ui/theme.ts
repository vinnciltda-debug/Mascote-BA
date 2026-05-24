import type { VisualTheme } from "../core/types";

export const BA_POU_THEME: VisualTheme = {
  background: {
    top: 0x9ed5cb,
    mid: 0xb8e2d5,
    bottom: 0x87c6bd
  },
  card: {
    base: 0xfffcf6,
    stroke: 0x2c241f,
    shadow: 0x000000
  },
  text: {
    primary: "#201a15",
    muted: "#5d534a",
    inverse: "#fffdf8"
  },
  state: {
    active: 0xfacc15,
    warning: 0xf97316,
    locked: 0x94a3b8,
    success: 0x22c55e
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24
  }
};

export function rarityColor(rarity: "common" | "rare" | "epic"): number {
  if (rarity === "epic") return 0xc084fc;
  if (rarity === "rare") return 0x60a5fa;
  return 0xd6d3d1;
}
