import BootScene        from "./scenes/BootScene.js";
import TutorialScene    from "./scenes/TutorialScene.js";
import LevelSelectScene from "./scenes/LevelSelectScene.js";
import GameScene        from "./scenes/GameScene.js";
import UIScene          from "./scenes/UIScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-wrapper',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 720,
  },
  backgroundColor: "#04040d",
  // Order matters: first scene auto-starts. UIScene is launched programmatically by GameScene.
  scene: [BootScene, TutorialScene, LevelSelectScene, GameScene, UIScene],
});