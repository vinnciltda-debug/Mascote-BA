import Phaser from "phaser";
import { MainScene } from "./features/main/MainScene";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#0f172a",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 414,
    height: 896
  },
  scene: [MainScene]
});

void game;
