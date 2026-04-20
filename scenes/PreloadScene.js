import AudioManager from "../managers/AudioManager.js";

export default class PreloadScene extends Phaser.Scene {
  constructor() { super("PreloadScene"); }

  preload() {
    // ── Progress bar ──────────────────────────────────────────────
    this.add.rectangle(600, 360, 400, 2, 0x111122);
    const bar   = this.add.rectangle(402, 360, 0, 6, 0x00ffcc).setOrigin(0, 0.5);
    const label = this.add.text(600, 340, "LOADING ASSETS...", {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#00ffcc",
    }).setOrigin(0.5);
    this.load.on("progress", v => { bar.width = 396 * v; });
    this.load.on("complete", () => label.setText("READY"));

    // ── Enemy spritesheets ────────────────────────────────────────
    // All enemies: 1024x123px, 8 frames at 128x123px
    // Frames 0–4 = walk, 5–7 = death
    const ENEMY_W = 128, ENEMY_H = 123;
    ["enemy_scout","enemy_runner","enemy_brute","enemy_phantom","enemy_colossus"]
      .forEach(key => this.load.spritesheet(key,
        `assets/sprites/${key}.png`,
        { frameWidth: ENEMY_W, frameHeight: ENEMY_H }
      ));

    // ── Tower spritesheets ────────────────────────────────────────
    // All towers: 1024x254px, 4 frames at 256x254px
    // Frame 0 = idle, frames 1–2 = charging, frame 3 = fire/smoke
    const TOWER_W = 256, TOWER_H = 254;
    ["tower_pulse","tower_storm","tower_titan","tower_apex"]
      .forEach(key => this.load.spritesheet(key,
        `assets/sprites/${key}.png`,
        { frameWidth: TOWER_W, frameHeight: TOWER_H }
      ));

    // ── Base core ─────────────────────────────────────────────────
    // 1024x254px, 3 frames at 341x254px (Phaser rounds, use 340 to be safe)
    this.load.spritesheet("base_core",
      "assets/sprites/base_core.png",
      { frameWidth: 256, frameHeight: 254 }
    );

    // ── Audio ─────────────────────────────────────────────────────
    this.load.audio("intro",       "assets/audio/intro.wav");
    this.load.audio("sfx_orbital", "assets/audio/sfx_orbital.wav");
    this.load.audio("sfx_shoot",    "assets/audio/sfx_shoot.wav");
    // this.load.audio("sfx_death",    "assets/audio/sfx_death.wav");
    // this.load.audio("sfx_upgrade",  "assets/audio/sfx_upgrade.wav");
    // this.load.audio("sfx_base_hit", "assets/audio/sfx_base_hit.wav");

    this.load.on("loaderror", file => {
      console.warn(`[Preload] Missing: ${file.src}`);
    });
  }

  create() {
    this._createEnemyAnims();
    this._createTowerAnims();
    this._createCoreAnim();

    // Init AudioManager here — BEFORE BootScene.
    // This stores the sound manager and registers the gesture unlock listener.
    // Music will NOT play until the user clicks something — that's correct.
    AudioManager.init(this);

    this.scene.start("BootScene");
  }

  _createEnemyAnims() {
    // [ key, walkFrames, deathFrames, walkFPS, deathFPS ]
    const defs = [
      ["enemy_scout",    [0,1,2,3,4], [5,6,7], 6,  10],
      ["enemy_runner",   [0,1,2,3,4], [5,6,7], 10, 12],
      ["enemy_brute",    [0,1,2,3,4], [5,6,7], 5,   8],
      ["enemy_phantom",  [0,1,2,3,4], [5,6,7], 12, 14],
      ["enemy_colossus", [0,1,2,3,4], [5,6,7], 2,   6],
    ];
    defs.forEach(([key, walk, death, wfps, dfps]) => {
      if (!this.textures.exists(key)) return;
      this.anims.create({ key: `${key}_walk`,
        frames: this.anims.generateFrameNumbers(key, { frames: walk }),
        frameRate: wfps, repeat: -1 });
      this.anims.create({ key: `${key}_death`,
        frames: this.anims.generateFrameNumbers(key, { frames: death }),
        frameRate: dfps, repeat: 0 });
    });
  }

  _createTowerAnims() {
    // All towers: frame 0 = idle static, frames 1-2 = charging, frame 3 = fire/smoke
    const defs = [
      ["tower_pulse", [0], [1,2,3]],
      ["tower_storm", [0], [1,2,3]],
      ["tower_titan", [0], [1,2,3]],
      ["tower_apex",  [0], [1,2,3]],
    ];
    defs.forEach(([key, idle, fire]) => {
      if (!this.textures.exists(key)) return;
      this.anims.create({ key: `${key}_idle`,
        frames: this.anims.generateFrameNumbers(key, { frames: idle }),
        frameRate: 2, repeat: -1 });
      this.anims.create({ key: `${key}_fire`,
        frames: this.anims.generateFrameNumbers(key, { frames: fire }),
        frameRate: 10, repeat: 0 });
    });
  }

  _createCoreAnim() {
    if (!this.textures.exists("base_core")) return;
    // Frames 0-1 idle pulse, frame 2 = hit
    this.anims.create({ key: "core_idle",
      frames: this.anims.generateFrameNumbers("base_core", { frames: [0, 1] }),
      frameRate: 2, repeat: -1 });
    this.anims.create({ key: "core_hit",
      frames: this.anims.generateFrameNumbers("base_core", { frames: [2, 1, 0] }),
      frameRate: 8, repeat: 0 });
  }
}