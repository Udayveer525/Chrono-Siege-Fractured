/**
 * ActHubScene — Campaign map showing all 5 acts.
 * Progress is loaded from localStorage.
 * Locked acts show a padlock. Completed acts show a checkmark.
 */

import { W, H }    from "./GameScene.js";
import { ACTS }    from "../data/story.js";
import { GAME_TITLE, GAME_SUBTITLE } from "../data/story.js";
import SaveManager from "../managers/SaveManager.js";

export default class ActHubScene extends Phaser.Scene {
  constructor() { super("ActHubScene"); }

  create() {
    this._buildBg();
    this._buildHeader();
    this._buildActCards();
    this._buildFooter();
  }

  _buildBg() {
    this.add.rectangle(W/2, H/2, W, H, 0x020208);
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.035);
    for (let x=0;x<=W;x+=50) g.lineBetween(x,0,x,H);
    for (let y=0;y<=H;y+=50) g.lineBetween(0,y,W,y);
    g.lineStyle(2, 0x00ffcc, 0.25);
    const cs = 28;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx=cx===0?1:-1, dy=cy===0?1:-1;
      g.lineBetween(cx,cy,cx+dx*cs,cy); g.lineBetween(cx,cy,cx,cy+dy*cs);
    });
  }

  _buildHeader() {
    this.add.text(W/2, 36, GAME_TITLE, {
      fontSize: "26px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "900",
      stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5);

    this.add.text(W/2, 62, GAME_SUBTITLE, {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ffcc", letterSpacing: 8,
    }).setOrigin(0.5);

    // Thin rule
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.18);
    g.lineBetween(60, 80, W-60, 80);

    this.add.text(W/2, 92, "— CAMPAIGN TIMELINE —", {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: "#445566", letterSpacing: 3,
    }).setOrigin(0.5);
  }

  _buildActCards() {
    const save   = SaveManager.load();
    const cardW  = 192;
    const cardH  = 420;
    const gap    = 24;
    const totalW = ACTS.length * cardW + (ACTS.length - 1) * gap;
    const startX = (W - totalW) / 2 + cardW / 2;

    ACTS.forEach((act, i) => {
      const cx = startX + i * (cardW + gap);
      const cy = H/2 + 20;

      const levelsCompleted = act.levelIds.filter(id => save.completed.includes(id)).length;
      const isUnlocked      = save.completed.length >= act.unlockRequirement;
      const isComplete      = levelsCompleted >= act.levelIds.length;

      this._buildActCard(cx, cy, cardW, cardH, act, isUnlocked, isComplete, levelsCompleted, save);
    });
  }

  _buildActCard(cx, cy, cw, ch, act, isUnlocked, isComplete, levelsCompleted, save) {
    const alpha   = isUnlocked ? 1 : 0.38;
    const stroke  = isComplete ? act.color : (isUnlocked ? 0x334444 : 0x111122);
    const strokeA = isComplete ? 0.8 : (isUnlocked ? 0.5 : 0.3);

    // Card bg
    const card = this.add.rectangle(cx, cy, cw, ch, 0x06060e);
    card.setStrokeStyle(1.5, stroke, strokeA).setAlpha(alpha);
    if (isUnlocked) card.setInteractive();

    // Colour accent bar at top
    const bar = this.add.rectangle(cx, cy - ch/2 + 5, cw - 2, 6, act.color, isUnlocked ? 0.7 : 0.2);

    // Act number
    this.add.text(cx, cy - 162, `ACT ${act.id}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? act.colorHex : "#334444",
    }).setOrigin(0.5).setAlpha(alpha);

    // Act name
    this.add.text(cx, cy - 142, act.name, {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif",
      color: isUnlocked ? "#ffffff" : "#445555",
      fontStyle: "bold", wordWrap: { width: cw - 16 }, align: "center",
    }).setOrigin(0.5).setAlpha(alpha);

    // Tagline
    this.add.text(cx, cy - 112, act.tagline, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? "#778899" : "#334444",
      wordWrap: { width: cw - 20 }, align: "center",
    }).setOrigin(0.5).setAlpha(alpha);

    // Divider
    const dg = this.add.graphics().setAlpha(alpha);
    dg.lineStyle(1, act.color, isUnlocked ? 0.2 : 0.08);
    dg.lineBetween(cx - cw/2 + 16, cy - 88, cx + cw/2 - 16, cy - 88);

    // Level dots
    act.levelIds.forEach((levelId, j) => {
      const dotX = cx - (act.levelIds.length - 1) * 18 / 2 + j * 18;
      const dotY = cy - 64;
      const done = save.completed.includes(levelId);
      this.add.circle(dotX, dotY, 6, done ? act.color : 0x1a2233).setAlpha(alpha)
        .setStrokeStyle(1, isUnlocked ? act.color : 0x334444, 0.5);
      if (done) {
        this.add.text(dotX, dotY, "✓", {
          fontSize: "8px", fontFamily: "'Share Tech Mono', monospace", color: "#000000",
        }).setOrigin(0.5).setAlpha(alpha);
      }
    });

    this.add.text(cx, cy - 38, `${levelsCompleted} / ${act.levelIds.length} COMPLETE`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? "#556677" : "#334444",
    }).setOrigin(0.5).setAlpha(alpha);

    // Theme tag
    this.add.text(cx, cy - 18, act.theme.toUpperCase(), {
      fontSize: "10px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? act.colorHex : "#223333",
      letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(alpha * 0.6);

    // Status badge
    if (!isUnlocked) {
      this.add.rectangle(cx, cy + 80, cw - 30, 36, 0x0a0a14)
        .setStrokeStyle(1, 0x334444, 0.5);
      this.add.text(cx, cy + 80, "🔒 LOCKED", {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#334455",
      }).setOrigin(0.5);

      // How many more levels needed
      const needed = act.unlockRequirement - save.completed.length;
      this.add.text(cx, cy + 104, `Complete ${needed} more level${needed !== 1 ? "s" : ""}`, {
        fontSize: "10px", fontFamily: "'Share Tech Mono', monospace", color: "#334444",
      }).setOrigin(0.5);

    } else if (isComplete) {
      this.add.rectangle(cx, cy + 80, cw - 30, 36, 0x001a00)
        .setStrokeStyle(1.5, act.color, 0.6);
      this.add.text(cx, cy + 80, "✓ COMPLETED", {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: act.colorHex,
      }).setOrigin(0.5);

    } else {
      // Play button
      const playBtn = this.add.rectangle(cx, cy + 80, cw - 30, 36, 0x001a11)
        .setStrokeStyle(1.5, act.color, 0.7).setInteractive();
      const playTxt = this.add.text(cx, cy + 80, "▶  ENTER", {
        fontSize: "13px", fontFamily: "'Orbitron', sans-serif",
        color: act.colorHex, fontStyle: "bold",
      }).setOrigin(0.5);

      playBtn.on("pointerover",  () => { playBtn.setAlpha(0.8); playTxt.setScale(1.05); });
      playBtn.on("pointerout",   () => { playBtn.setAlpha(1);   playTxt.setScale(1); });
      playBtn.on("pointerdown",  () => this._enterAct(act, save));
    }

    // Card hover glow (unlocked only)
    if (isUnlocked && !isComplete) {
      card.on("pointerover", () => { card.setStrokeStyle(2, act.color, 0.7); bar.setAlpha(1); });
      card.on("pointerout",  () => { card.setStrokeStyle(1.5, stroke, strokeA); bar.setAlpha(isUnlocked ? 0.7 : 0.2); });
    }
  }

  _enterAct(act, save) {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      // Show cinematic if this act has never been started
      const actStarted = act.levelIds.some(id => save.completed.includes(id));
      if (!actStarted) {
        this.scene.start("CinematicScene", {
          act,
          nextScene: "LevelSelectScene",
          nextData:  { actId: act.id },
        });
      } else {
        this.scene.start("LevelSelectScene", { actId: act.id });
      }
    });
  }

  _buildFooter() {
    const save = SaveManager.load();
    const total = Object.values(ACTS).reduce((s, a) => s + a.levelIds.length, 0);

    this.add.text(W/2, H - 28, `PROGRESS: ${save.completed.length} / ${total} LEVELS  •  SCORE: ${save.totalScore}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#334455",
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.rectangle(78, 36, 130, 32, 0x0a0a16)
      .setStrokeStyle(1, 0x334455, 0.6).setInteractive();
    this.add.text(78, 36, "← MENU", {
      fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#556677",
    }).setOrigin(0.5);
    backBtn.on("pointerdown", () => {
      this.cameras.main.fade(300, 0,0,0);
      this.time.delayedCall(320, () => this.scene.start("BootScene"));
    });
  }
}