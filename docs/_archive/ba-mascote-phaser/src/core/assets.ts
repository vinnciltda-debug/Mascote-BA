import type { AssetRegistry } from "./types";

export const ASSET_REGISTRY: AssetRegistry = {
  packs: [
    {
      id: "kenney-ui-pack",
      label: "Kenney UI Pack",
      license: "CC0",
      sourceUrl: "https://kenney.nl/assets/ui-pack",
      notes: "Botoes, paineis e elementos de interface com licenca CC0."
    },
    {
      id: "phaser-labs-ui-icons",
      label: "Phaser Examples and Open Assets",
      license: "OpenSource",
      sourceUrl: "https://github.com/phaserjs/phaser",
      notes: "Referencias de implementacao e estrutura de game UI em Phaser."
    }
  ]
};
