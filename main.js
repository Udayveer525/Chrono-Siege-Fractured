import BootScene from "./scenes/BootScene.js";
import CinematicScene from "./scenes/CinematicScene.js";
import ActHubScene from "./scenes/ActHubScene.js";
import TutorialScene from "./scenes/TutorialScene.js";
import LevelSelectScene from "./scenes/LevelSelectScene.js";
import GameScene from "./scenes/GameScene.js";
import UIScene from "./scenes/UIScene.js";
import PreloadScene from "./scenes/PreloadScene.js";

import LevelEditorScene from "./scenes/LevelEditorScene.js";

const editorMode = false;

if (editorMode) {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-wrapper",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1200,
      height: 720,
    },
    backgroundColor: "#020208",
    scene: [LevelEditorScene],
  });
}
else {
  new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-wrapper",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1200,
    height: 720,
  },
  backgroundColor: "#020208",
  scene: [
    PreloadScene, // loads assets, then starts BootScene
    BootScene, // auto-starts
    CinematicScene, // launched by BootScene / ActHubScene
    ActHubScene, // campaign map
    TutorialScene, // field manual
    LevelSelectScene, // levels within an act
    GameScene, // gameplay
    UIScene, // HUD (launched by GameScene)
  ],
});
}
