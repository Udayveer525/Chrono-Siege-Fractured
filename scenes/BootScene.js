import { W, H } from "./GameScene.js";
import { GAME_TITLE, GAME_SUBTITLE, ACTS } from "../data/story.js";
import SaveManager from "../managers/SaveManager.js";
import AudioManager from "../managers/AudioManager.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this._buildAnimatedBg();
    this._buildTitle();
    this._buildButtons();

    // Update AudioManager's scene reference so fade tweens work here,
    // then queue the music (plays after first user gesture automatically)
    AudioManager.updateScene(this);
    AudioManager.playMusic("intro");
  }

  _buildAnimatedBg() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.05);
    for (let x = 0; x <= W; x += 50) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 50) g.lineBetween(0, y, W, y);
    g.lineStyle(2, 0x00ffcc, 0.3);
    const cs = 36;
    [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ].forEach(([cx, cy]) => {
      const dx = cx === 0 ? 1 : -1,
        dy = cy === 0 ? 1 : -1;
      g.lineBetween(cx, cy, cx + dx * cs, cy);
      g.lineBetween(cx, cy, cx, cy + dy * cs);
    });

    // Scanning line
    this._scan = this.add.rectangle(0, 0, W, 2, 0x00ffcc, 0.12).setOrigin(0, 0);
    this.tweens.add({
      targets: this._scan,
      y: H,
      duration: 3200,
      repeat: -1,
      ease: "Linear",
    });

    // Floating dots
    for (let i = 0; i < 20; i++) {
      const px = Phaser.Math.Between(40, W - 40),
        py = Phaser.Math.Between(40, H - 40);
      const dot = this.add.circle(
        px,
        py,
        Phaser.Math.Between(1, 3),
        0x00ffcc,
        Phaser.Math.FloatBetween(0.06, 0.35),
      );
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(30, 90),
        alpha: 0,
        duration: Phaser.Math.Between(2500, 5000),
        delay: Phaser.Math.Between(0, 2500),
        repeat: -1,
        onRepeat: () => {
          dot.y = py;
          dot.alpha = Phaser.Math.FloatBetween(0.06, 0.35);
        },
      });
    }

    // Faint path preview
    const pg = this.add.graphics();
    pg.lineStyle(1, 0x00ffcc, 0.07);
    [
      [80, 560],
      [600, 560],
      [600, 160],
      [200, 160],
      [200, 380],
      [500, 380],
    ].reduce((prev, curr, i, arr) => {
      if (i > 0) pg.lineBetween(arr[i - 1][0], arr[i - 1][1], curr[0], curr[1]);
      return curr;
    });
  }

  _buildTitle() {
    const items = [];

    items.push(
      this.add
        .text(W / 2, 150, GAME_TITLE, {
          fontSize: "68px",
          fontFamily: "'Orbitron', sans-serif",
          color: "#ffffff",
          fontStyle: "900",
          stroke: "#00ffcc",
          strokeThickness: 2,
          shadow: {
            offsetX: 0,
            offsetY: 0,
            color: "#00ffcc",
            blur: 28,
            fill: true,
          },
        })
        .setOrigin(0.5)
        .setAlpha(0),
    );

    items.push(
      this.add
        .text(W / 2, 220, GAME_SUBTITLE, {
          fontSize: "18px",
          fontFamily: "'Share Tech Mono', monospace",
          color: "#00ffcc",
          letterSpacing: 8,
        })
        .setOrigin(0.5)
        .setAlpha(0),
    );

    items.push(
      this.add
        .text(W / 2, 260, '"Hold the line. Preserve our reality."', {
          fontSize: "13px",
          fontFamily: "'Share Tech Mono', monospace",
          color: "#99bbcc",
        })
        .setOrigin(0.5)
        .setAlpha(0),
    );

    items.forEach((item, i) => {
      this.tweens.add({
        targets: item,
        alpha: 1,
        y: item.y - 10,
        duration: 600,
        delay: 200 + i * 200,
        ease: "Quad.Out",
      });
    });

    this.add
      .text(W - 16, H - 16, "Alpha Build 0.3", {
        fontSize: "10px",
        fontFamily: "'Share Tech Mono', monospace",
        color: "#223",
      })
      .setOrigin(1, 1);
  }

  _buildButtons() {
    const save = SaveManager.load();

    // PLAY button
    this._makeButton(
      W / 2,
      356,
      240,
      60,
      "▶  PLAY",
      "#00ffcc",
      0x001a14,
      0x00ffcc,
      () => {
        this._go(() => {
          if (save.firstRun) {
            // First time: play Act 1 cinematic
            this.scene.start("CinematicScene", {
              act: ACTS[0],
              nextScene: "LevelSelectScene",
              nextData: { actId: 1 },
            });
          } else {
            this.scene.start("ActHubScene");
          }
        });
      },
    );

    // HOW TO PLAY
    this._makeButton(
      W / 2,
      430,
      240,
      50,
      "?  FIELD MANUAL",
      "#aaaaff",
      0x080820,
      0x4444ff,
      () => {
        this._go(() => this.scene.start("TutorialScene"));
      },
    );

    // RESET (small, subtle)
    const rstBtn = this.add
      .text(W / 2, 504, "Reset Progress", {
        fontSize: "13px",
        fontFamily: "'Share Tech Mono', monospace",
        color: "#99bbcc",
      })
      .setOrigin(0.5)
      .setInteractive();
    rstBtn.on("pointerover", () => rstBtn.setColor("#445566"));
    rstBtn.on("pointerout", () => rstBtn.setColor("#99bbcc"));
    rstBtn.on("pointerdown", () => {
      this._showResetConfirm();
    });

    // SETTINGS button
    const setBtn = this.add
      .text(W / 2, 540, "Settings", {
        fontSize: "13px",
        fontFamily: "'Share Tech Mono', monospace",
        color: "#99bbcc",
      })
      .setOrigin(0.5)
      .setInteractive();
    setBtn.on("pointerover", () => setBtn.setColor("#445566"));
    setBtn.on("pointerout", () => setBtn.setColor("#99bbcc"));
    setBtn.on("pointerdown", () => {
      this._showSettings();
    });

    this.add
      .text(W / 2, H - 38, "Inspired by Kingdom Rush  •  Built with Phaser 3", {
        fontSize: "11px",
        fontFamily: "'Share Tech Mono', monospace",
        color: "#99bbcc",
      })
      .setOrigin(0.5);
  }

  _makeButton(x, y, w, h, label, textColor, fill, stroke, onClick) {
    const bg = this.add
      .rectangle(x, y, w, h, fill, 0)
      .setStrokeStyle(1.5, stroke, 0.65)
      .setInteractive()
      .setAlpha(0);
    const txt = this.add
      .text(x, y, label, {
        fontSize: "15px",
        fontFamily: "'Orbitron', sans-serif",
        color: textColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: [bg, txt],
      alpha: 1,
      duration: 500,
      delay: 800,
    });
    bg.on("pointerover", () => {
      bg.setFillStyle(stroke, 0.12);
      txt.setScale(1.05);
    });
    bg.on("pointerout", () => {
      bg.setFillStyle(fill, 0);
      txt.setScale(1);
    });
    bg.on("pointerdown", () => onClick());
  }

  _go(fn) {
    this.cameras.main.fade(380, 0, 0, 0);
    this.time.delayedCall(400, fn);
  }

  _showResetConfirm() {
    const overlay = this.add.container(0, 0).setDepth(100);
    overlay.add(this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setInteractive());
    
    const panel = this.add.rectangle(W/2, H/2, 360, 200, 0x0a0a1a).setStrokeStyle(2, 0xff2222, 0.6);
    overlay.add(panel);

    overlay.add(this.add.text(W/2, H/2 - 50, "RESET PROGRESS?", {
      fontSize: "24px", fontFamily: "'Orbitron', sans-serif", color: "#ff4444", fontStyle: "bold"
    }).setOrigin(0.5));

    overlay.add(this.add.text(W/2, H/2 - 10, "This action cannot be undone.", {
      fontSize: "14px", fontFamily: "'Share Tech Mono', monospace", color: "#888"
    }).setOrigin(0.5));

    const yesBtn = this.add.rectangle(W/2 - 70, H/2 + 50, 100, 40, 0x330000).setStrokeStyle(1, 0xff4444).setInteractive();
    overlay.add(yesBtn);
    overlay.add(this.add.text(W/2 - 70, H/2 + 50, "YES", { fontSize: "14px", fontFamily: "'Orbitron', sans-serif", color: "#ff4444" }).setOrigin(0.5));

    const noBtn = this.add.rectangle(W/2 + 70, H/2 + 50, 100, 40, 0x002211).setStrokeStyle(1, 0x00ff44).setInteractive();
    overlay.add(noBtn);
    overlay.add(this.add.text(W/2 + 70, H/2 + 50, "NO", { fontSize: "14px", fontFamily: "'Orbitron', sans-serif", color: "#00ff44" }).setOrigin(0.5));

    yesBtn.on("pointerdown", () => {
      SaveManager.reset();
      this.scene.restart();
    });

    noBtn.on("pointerdown", () => overlay.destroy());
  }

  _showSettings() {
    const overlay = this.add.container(0, 0).setDepth(100);
    overlay.add(this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85).setInteractive());
    
    const panel = this.add.rectangle(W/2, H/2, 400, 320, 0x050510).setStrokeStyle(2, 0x00ffcc, 0.6);
    overlay.add(panel);

    overlay.add(this.add.text(W/2, H/2 - 110, "SETTINGS", {
      fontSize: "32px", fontFamily: "'Orbitron', sans-serif", color: "#00ffcc", fontStyle: "bold"
    }).setOrigin(0.5));

    const save = SaveManager.load();
    let { sfxVolume, musicVolume } = save;

    const createVolumeControl = (y, label, initialValue, onUpdate) => {
      overlay.add(this.add.text(W/2, y - 20, label, { fontSize: "14px", fontFamily: "'Share Tech Mono', monospace", color: "#888" }).setOrigin(0.5));
      
      const valTxt = this.add.text(W/2, y, `${Math.round(initialValue * 100)}%`, { fontSize: "20px", fontFamily: "'Orbitron', sans-serif", color: "#fff" }).setOrigin(0.5);
      overlay.add(valTxt);
      
      const minus = this.add.text(W/2 - 60, y, "-", { fontSize: "24px", color: "#ff4444" }).setOrigin(0.5).setInteractive();
      const plus = this.add.text(W/2 + 60, y, "+", { fontSize: "24px", color: "#44ff44" }).setOrigin(0.5).setInteractive();
      
      let val = initialValue;
      minus.on("pointerdown", () => {
        val = Math.max(0, val - 0.1);
        valTxt.setText(`${Math.round(val * 100)}%`);
        onUpdate(val);
      });
      plus.on("pointerdown", () => {
        val = Math.min(1, val + 0.1);
        valTxt.setText(`${Math.round(val * 100)}%`);
        onUpdate(val);
      });
      overlay.add([minus, plus]);
    };

    createVolumeControl(H/2 - 30, "SFX VOLUME", sfxVolume, (v) => { SaveManager.updateSettings({ sfxVolume: v }); AudioManager.playSFX("sfx_shoot", 0.3); });
    createVolumeControl(H/2 + 40, "MUSIC VOLUME", musicVolume, (v) => { SaveManager.updateSettings({ musicVolume: v }); AudioManager.setMusicVolume(v); });

    const closeBtn = this.add.rectangle(W/2, H/2 + 110, 200, 40, 0x002211).setStrokeStyle(1, 0x00ff44).setInteractive();
    overlay.add(closeBtn);
    overlay.add(this.add.text(W/2, H/2 + 110, "CLOSE", { fontSize: "14px", fontFamily: "'Orbitron', sans-serif", color: "#00ff44" }).setOrigin(0.5));

    closeBtn.on("pointerdown", () => overlay.destroy());
  }
}