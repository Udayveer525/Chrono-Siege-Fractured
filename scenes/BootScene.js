/**
 * BootScene — Home screen with Play + Instructions buttons.
 * Animated background matching the game's sci-fi aesthetic.
 */

import { W, H } from "./GameScene.js";

export default class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  create() {
    this._buildAnimatedBg();
    this._buildTitle();
    this._buildButtons();
  }

  _buildAnimatedBg() {
    // Grid
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.05);
    for (let x = 0; x <= W; x += 50) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 50) g.lineBetween(0, y, W, y);

    // Corner brackets
    g.lineStyle(2, 0x00ffcc, 0.35);
    const cs = 36;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx = cx===0?1:-1, dy = cy===0?1:-1;
      g.lineBetween(cx, cy, cx+dx*cs, cy);
      g.lineBetween(cx, cy, cx, cy+dy*cs);
    });

    // Animated scan line
    this._scanLine = this.add.rectangle(0, 0, W, 2, 0x00ffcc, 0.15).setOrigin(0,0);
    this.tweens.add({
      targets: this._scanLine,
      y: H,
      duration: 3000,
      repeat: -1,
      ease: "Linear",
    });

    // Floating particles
    for (let i = 0; i < 18; i++) {
      const px = Phaser.Math.Between(40, W-40);
      const py = Phaser.Math.Between(40, H-40);
      const dot = this.add.circle(px, py, Phaser.Math.Between(1,3), 0x00ffcc, Phaser.Math.FloatBetween(0.1, 0.4));
      this.tweens.add({
        targets: dot,
        y: py - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4500),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        yoyo: false,
        onRepeat: () => { dot.y = py; dot.alpha = Phaser.Math.FloatBetween(0.1, 0.4); },
      });
    }

    // Decorative path preview (faint) — hints at the game map
    const pg = this.add.graphics();
    pg.lineStyle(1, 0x00ffcc, 0.08);
    const previewPts = [
      [80, 560], [600, 560], [600, 160], [200, 160], [200, 380], [500, 380]
    ];
    for (let i = 0; i < previewPts.length - 1; i++) {
      pg.lineBetween(previewPts[i][0], previewPts[i][1], previewPts[i+1][0], previewPts[i+1][1]);
    }
  }

  _buildTitle() {
    // Game logo
    this.add.text(W/2, 148, "NOVA DEFENSE", {
      fontSize: "64px",
      fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff",
      fontStyle: "900",
      stroke: "#00ffcc",
      strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, color: "#00ffcc", blur: 24, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(W/2, 218, "DEFEND. ADAPT. SURVIVE.", {
      fontSize: "15px",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#00ffcc",
      letterSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    // Version tag
    this.add.text(W - 16, H - 16, "v0.2 — SECTOR ZERO", {
      fontSize: "10px",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#334",
    }).setOrigin(1, 1);

    // Animate in
    const items = this.children.list.filter(c => c.alpha === 0);
    items.forEach((item, i) => {
      this.tweens.add({ targets: item, alpha: 1, y: item.y - 10, duration: 600, delay: 200 + i * 180, ease: "Quad.Out" });
    });
  }

  _buildButtons() {
    const btnY   = 360;
    const btnGap = 140;

    // ── PLAY ──
    this._makeButton(W/2, btnY, 220, 58, "▶  PLAY GAME", "#00ffcc", 0x002222, 0x00ffcc, () => {
      this._transitionTo("LevelSelectScene");
    });

    // ── INSTRUCTIONS ──
    this._makeButton(W/2, btnY + btnGap, 220, 54, "?  HOW TO PLAY", "#aaaaff", 0x0a0a22, 0x4444ff, () => {
      this._transitionTo("TutorialScene");
    });

    // Credits line
    this.add.text(W/2, H - 40, "Inspired by Kingdom Rush  •  Made with Phaser 3", {
      fontSize: "11px",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#222",
    }).setOrigin(0.5);
  }

  _makeButton(x, y, w, h, label, textColor, fillColor, strokeColor, onClick) {
    const bg = this.add.rectangle(x, y, w, h, fillColor, 0)
      .setStrokeStyle(1.5, strokeColor, 0.7)
      .setInteractive()
      .setAlpha(0);

    const txt = this.add.text(x, y, label, {
      fontSize: "14px",
      fontFamily: "'Orbitron', sans-serif",
      color: textColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [bg, txt], alpha: 1, duration: 500, delay: 800 });

    bg.on("pointerover",  () => { bg.setFillStyle(strokeColor, 0.15); txt.setScale(1.05); });
    bg.on("pointerout",   () => { bg.setFillStyle(fillColor, 0); txt.setScale(1); });
    bg.on("pointerdown",  () => onClick());
    return bg;
  }

  _transitionTo(scene) {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(420, () => this.scene.start(scene));
  }
}