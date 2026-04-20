/**
 * LevelSelectScene — horizontally scrollable level cards.
 * Uses camera.scrollX for scrolling — native Phaser, no coordinate hacks.
 * UI elements use setScrollFactor(0) to stay fixed.
 */

import { W, H }             from "./GameScene.js";
import { ACTS, LEVEL_LORE } from "../data/story.js";
import { LEVELS }           from "../data/levels.js";
import SaveManager          from "../managers/SaveManager.js";

const CARD_W    = 360;
const CARD_H    = 500;
const CARD_GAP  = 36;
const CARD_STEP = CARD_W + CARD_GAP;
const LAYOUT_OFFSET = W / 2;

export default class LevelSelectScene extends Phaser.Scene {
  constructor() { super("LevelSelectScene"); }

  init(data) {
    this.actId = data?.actId || 1;
    this.act   = ACTS.find(a => a.id === this.actId) || ACTS[0];
  }

  create() {
    const save = SaveManager.load();
    this._currentCard = 0;
    this._wasDragging = false;
    this._dragStartX  = 0;
    this._dragStartScrollX = 0;

    this._buildBg();
    this._buildAllCards(save);
    this._buildUI(save);
    this._setupInput();

    this.cameras.main.scrollX = 0;
  }

  _buildBg() {
    const totalW = LAYOUT_OFFSET + this.act.levelIds.length * CARD_STEP + W;
    this.add.rectangle(totalW / 2, H / 2, totalW, H, 0x020208);
    const g = this.add.graphics();
    g.lineStyle(1, this.act.color, 0.04);
    for (let x = 0; x <= totalW; x += 50) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 50)       g.lineBetween(0, y, totalW, y);
  }

  _buildAllCards(save) {
    this.act.levelIds.forEach((levelId, i) => {
      const cx      = LAYOUT_OFFSET + i * CARD_STEP;
      const cy      = H / 2 + 14;
      const lore    = LEVEL_LORE[levelId];
      const level   = LEVELS.find(l => l.id === levelId);
      const done    = save.completed.includes(levelId);
      const best    = save.bestScores[levelId] || 0;
      const unlocked= i === 0 || save.completed.includes(this.act.levelIds[i - 1]);
      this._buildCard(cx, cy, levelId, lore, level, done, best, unlocked);
    });
  }

  _buildCard(cx, cy, levelId, lore, level, done, best, unlocked) {
    const act    = this.act;
    const locked = !unlocked;
    const alpha  = locked ? 0.4 : 1;
    const cw = CARD_W, ch = CARD_H;

    // bg
    this.add.rectangle(cx, cy, cw, ch, 0x07070f).setAlpha(alpha)
      .setStrokeStyle(1.5,
        done ? act.color : (locked ? 0x111122 : 0x223333),
        done ? 0.75 : (locked ? 0.2 : 0.4));

    // top bar
    this.add.rectangle(cx, cy - ch/2 + 5, cw - 2, 7, act.color,
      locked ? 0.1 : (done ? 0.8 : 0.3));

    // mission tag
    this.add.text(cx, cy - ch/2 + 26, `MISSION ${levelId}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: locked ? "#223333" : "#445566",
    }).setOrigin(0.5).setAlpha(alpha);

    // level name
    this.add.text(cx, cy - ch/2 + 60, lore?.name || `LEVEL ${levelId}`, {
      fontSize: "19px", fontFamily: "'Orbitron', sans-serif",
      color: locked ? "#334444" : "#ffffff", fontStyle: "bold",
      wordWrap: { width: cw - 30 }, align: "center",
    }).setOrigin(0.5).setAlpha(alpha);

    // subtitle
    this.add.text(cx, cy - ch/2 + 94, lore?.subtitle || "", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace",
      color: locked ? "#223333" : act.colorHex,
    }).setOrigin(0.5).setAlpha(alpha);

    // divider
    const dg = this.add.graphics();
    dg.lineStyle(1, act.color, locked ? 0.12 : 0.25);
    dg.lineBetween(cx - cw/2 + 20, cy - ch/2 + 116, cx + cw/2 - 20, cy - ch/2 + 116);

    // lore or lock message
    if (locked) {
      this.add.text(cx, cy - 10, "🔒", { fontSize: "36px" }).setOrigin(0.5);
      this.add.text(cx, cy + 42, "Complete the previous\nmission to unlock.", {
        fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
        color: "#334455", align: "center", lineSpacing: 4,
      }).setOrigin(0.5);
    } else {
      this.add.text(cx, cy - ch/2 + 130, lore?.lore || "", {
        fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
        color: "#aabbcc", align: "center", lineSpacing: 6,
        wordWrap: { width: cw - 44 },
      }).setOrigin(0.5, 0);
    }

    // stats strip — only for unlocked cards, well above button
    if (!locked && level) {
      const sy = cy + ch/2 - 130;
      const sg = this.add.graphics();
      sg.lineStyle(1, act.color, 0.18);
      sg.lineBetween(cx - cw/2 + 20, sy, cx + cw/2 - 20, sy);

      this.add.text(cx - 90, sy + 18, `${level.waves.length} WAVES`, {
        fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#556677",
      }).setOrigin(0.5);
      this.add.text(cx, sy + 18, `⬡ ${level.startGold}`, {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#aa8800",
      }).setOrigin(0.5);
      this.add.text(cx + 90, sy + 18, `HP ${level.baseHP}`, {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#aa5555",
      }).setOrigin(0.5);
    }

    // best score — between stats and button, enough room
    if (done && best > 0) {
      this.add.text(cx, cy + ch/2 - 100, `BEST: ${best}`, {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: act.colorHex,
      }).setOrigin(0.5);
    }

    // action button
    const btnY = cy + ch/2 - 46;
    if (locked) {
      this.add.rectangle(cx, btnY, cw - 40, 48, 0x0a0a0a).setStrokeStyle(1, 0x223333, 0.4);
      this.add.text(cx, btnY, "🔒  LOCKED", {
        fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#334455",
      }).setOrigin(0.5);
    } else {
      const btn = this.add.rectangle(cx, btnY, cw - 40, 48, done ? 0x0a1a00 : 0x001a11)
        .setStrokeStyle(2, act.color, 0.8).setInteractive();
      this.add.text(cx, btnY, done ? "↺  REPLAY" : "▶  DEPLOY", {
        fontSize: "14px", fontFamily: "'Orbitron', sans-serif",
        color: act.colorHex, fontStyle: "bold",
      }).setOrigin(0.5);

      btn.on("pointerover", () => btn.setFillStyle(done ? 0x133300 : 0x003322));
      btn.on("pointerout",  () => btn.setFillStyle(done ? 0x0a1a00 : 0x001a11));
      btn.on("pointerup",   () => {
        if (this._wasDragging) return;
        this.cameras.main.fade(380, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.stop("UIScene");
          this.scene.start("GameScene", { levelId });
        });
      });
    }
  }

  // ─── UI (fixed with setScrollFactor(0)) ─────────────────────────
  _buildUI(save) {
    // Header bg
    this.add.rectangle(W/2, 46, W, 92, 0x020208).setScrollFactor(0).setDepth(20);

    this.add.text(W/2, 34, `ACT ${this.act.id}  —  ${this.act.name}`, {
      fontSize: "22px", fontFamily: "'Orbitron', sans-serif",
      color: this.act.colorHex, fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

    this.add.text(W/2, 62, this.act.tagline, {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace", color: "#778899",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

    const hg = this.add.graphics().setScrollFactor(0).setDepth(21);
    hg.lineStyle(1, this.act.color, 0.18);
    hg.lineBetween(60, 82, W-60, 82);

    // Edge fades
    this.add.rectangle(40, H/2, 80, H, 0x020208).setScrollFactor(0).setDepth(20);
    this.add.rectangle(W-40, H/2, 80, H, 0x020208).setScrollFactor(0).setDepth(20);

    // Arrows
    this._leftArrow  = this.add.text(28, H/2, "‹", {
      fontSize: "44px", fontFamily: "'Orbitron', sans-serif", color: this.act.colorHex,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);
    this._rightArrow = this.add.text(W-28, H/2, "›", {
      fontSize: "44px", fontFamily: "'Orbitron', sans-serif", color: this.act.colorHex,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    // Nav dots
    const n = this.act.levelIds.length;
    this._dots = this.act.levelIds.map((_, i) => {
      const x = W/2 + (i - (n - 1) / 2) * 20;
      return this.add.arc(x, H - 26, 4, 0, 360, false, this.act.color, 0.3)
        .setScrollFactor(0).setDepth(22);
    });

    // Back button
    const backBtn = this.add.rectangle(78, 36, 130, 32, 0x0a0a16)
      .setStrokeStyle(1, 0x334455, 0.6).setInteractive().setScrollFactor(0).setDepth(22);
    this.add.text(78, 36, "← ACTS", {
      fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#556677",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(23);
    backBtn.on("pointerover",  () => backBtn.setFillStyle(0x151525));
    backBtn.on("pointerout",   () => backBtn.setFillStyle(0x0a0a16));
    backBtn.on("pointerdown",  () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start("ActHubScene"));
    });

    this._refreshUI();
  }

  _refreshUI() {
    if (!this._leftArrow) return;
    const n = this.act.levelIds.length;
    this._leftArrow.setAlpha(this._currentCard <= 0 ? 0.12 : 0.6);
    this._rightArrow.setAlpha(this._currentCard >= n - 1 ? 0.12 : 0.6);
    this._dots?.forEach((d, i) => {
      d.setAlpha(i === this._currentCard ? 1 : 0.3);
      d.setRadius(i === this._currentCard ? 6 : 4);
    });
  }

  // ─── INPUT ───────────────────────────────────────────────────────
  _setupInput() {
    this.input.on("pointerdown", (p) => {
      this._dragStartX = p.x;
      this._dragStartScrollX = this.cameras.main.scrollX;
      this._wasDragging = false;
    });

    this.input.on("pointermove", (p) => {
      if (!p.isDown) return;
      const dx = this._dragStartX - p.x;
      if (Math.abs(dx) > 8) this._wasDragging = true;
      if (this._wasDragging) {
        this.cameras.main.scrollX = this._dragStartScrollX + dx;
        this._clampCamera();
      }
    });

    this.input.on("pointerup", () => {
      if (this._wasDragging) this._snapCamera();
      this.time.delayedCall(60, () => { this._wasDragging = false; });
    });

    const onWheel = (e) => {
      e.preventDefault();
      const n = this.act.levelIds.length;
      this._currentCard = Phaser.Math.Clamp(
        this._currentCard + Math.sign(e.deltaY), 0, n - 1);
      this._snapCamera();
    };
    this.game.canvas.addEventListener("wheel", onWheel, { passive: false });
    this.events.once("shutdown", () => this.game.canvas.removeEventListener("wheel", onWheel));

    const keys = this.input.keyboard.createCursorKeys();
    const n = this.act.levelIds.length;
    keys.left.on("down",  () => {
      this._currentCard = Math.max(0, this._currentCard - 1); this._snapCamera();
    });
    keys.right.on("down", () => {
      this._currentCard = Math.min(n - 1, this._currentCard + 1); this._snapCamera();
    });
  }

  _clampCamera() {
    const max = (this.act.levelIds.length - 1) * CARD_STEP;
    this.cameras.main.scrollX = Phaser.Math.Clamp(this.cameras.main.scrollX, 0, max);
  }

  _snapCamera() {
    const nearestFromPos = Math.round(this.cameras.main.scrollX / CARD_STEP);
    const n = this.act.levelIds.length;
    this._currentCard = Phaser.Math.Clamp(
      isNaN(nearestFromPos) ? this._currentCard : nearestFromPos, 0, n - 1);
    const targetScrollX = this._currentCard * CARD_STEP;

    this.tweens.killTweensOf(this.cameras.main);
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: targetScrollX,
      duration: 300,
      ease: "Quad.Out",
      onUpdate:  () => this._refreshUI(),
      onComplete:() => this._refreshUI(),
    });
  }
}