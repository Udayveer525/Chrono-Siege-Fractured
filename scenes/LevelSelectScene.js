import { W, H }          from "./GameScene.js";
import { ACTS, LEVEL_LORE } from "../data/story.js";
import { LEVELS }        from "../data/levels.js";
import SaveManager       from "../managers/SaveManager.js";

export default class LevelSelectScene extends Phaser.Scene {
  constructor() { super("LevelSelectScene"); }

  init(data) {
    this.actId = data?.actId || 1;
    this.act   = ACTS.find(a => a.id === this.actId) || ACTS[0];
  }

  create() {
    const save = SaveManager.load();
    this._buildBg();
    this._buildHeader();
    this._buildLevelCards(save);
    this._buildBackButton();
  }

  _buildBg() {
    this.add.rectangle(W/2, H/2, W, H, 0x020208);
    const g = this.add.graphics();
    g.lineStyle(1, this.act.color, 0.04);
    for (let x=0;x<=W;x+=50) g.lineBetween(x,0,x,H);
    for (let y=0;y<=H;y+=50) g.lineBetween(0,y,W,y);
    g.lineStyle(2, this.act.color, 0.25);
    const cs = 28;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx=cx===0?1:-1, dy=cy===0?1:-1;
      g.lineBetween(cx,cy,cx+dx*cs,cy); g.lineBetween(cx,cy,cx,cy+dy*cs);
    });
  }

  _buildHeader() {
    this.add.text(W/2, 34, `ACT ${this.act.id}  —  ${this.act.name}`, {
      fontSize: "22px", fontFamily: "'Orbitron', sans-serif",
      color: this.act.colorHex, fontStyle: "bold",
    }).setOrigin(0.5);

    this.add.text(W/2, 62, this.act.tagline, {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace", color: "#778899",
    }).setOrigin(0.5);

    const dg = this.add.graphics();
    dg.lineStyle(1, this.act.color, 0.2);
    dg.lineBetween(60, 82, W-60, 82);
  }

  _buildLevelCards(save) {
    const levelIds = this.act.levelIds;
    const cw = Math.min(300, (W - 80) / levelIds.length - 24);
    const ch = 460;
    const gap = 24;
    const totalW = levelIds.length * cw + (levelIds.length - 1) * gap;
    const startX = (W - totalW) / 2 + cw / 2;

    levelIds.forEach((levelId, i) => {
      const cx     = startX + i * (cw + gap);
      const cy     = H/2 + 22;
      const lore   = LEVEL_LORE[levelId];
      const level  = LEVELS.find(l => l.id === levelId);
      const done   = save.completed.includes(levelId);
      const best   = save.bestScores[levelId] || 0;

      this._buildCard(cx, cy, cw, ch, levelId, lore, level, done, best, i);
    });
  }

  _buildCard(cx, cy, cw, ch, levelId, lore, level, done, best, index) {
    const act = this.act;

    // Card
    const card = this.add.rectangle(cx, cy, cw, ch, 0x06060e);
    card.setStrokeStyle(1.5, done ? act.color : 0x223333, done ? 0.7 : 0.4).setInteractive();

    // Top colour bar
    this.add.rectangle(cx, cy - ch/2 + 5, cw - 2, 6, act.color, done ? 0.7 : 0.25);

    // Level number
    this.add.text(cx, cy - 196, `MISSION ${levelId}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#445566",
    }).setOrigin(0.5);

    // Level name
    this.add.text(cx, cy - 174, lore?.name || `LEVEL ${levelId}`, {
      fontSize: "15px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
      wordWrap: { width: cw - 20 }, align: "center",
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 148, lore?.subtitle || "", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: act.colorHex,
    }).setOrigin(0.5);

    // Divider
    const dg = this.add.graphics();
    dg.lineStyle(1, act.color, 0.15);
    dg.lineBetween(cx - cw/2 + 16, cy - 130, cx + cw/2 - 16, cy - 130);

    // Lore text — properly sized and coloured
    this.add.text(cx, cy - 116, lore?.lore || "", {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
      color: "#aabbcc", align: "center", lineSpacing: 5,
      wordWrap: { width: cw - 32 },
    }).setOrigin(0.5, 0);

    // Stats (from level data if available)
    if (level) {
      dg.lineBetween(cx - cw/2 + 16, cy + 110, cx + cw/2 - 16, cy + 110);
      this.add.text(cx - 60, cy + 124, `${level.waves.length} WAVES`, {
        fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#556677",
      }).setOrigin(0.5);
      this.add.text(cx + 60, cy + 124, `⬡ ${level.startGold}`, {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#aa8800",
      }).setOrigin(0.5);
    }

    // Best score
    if (done && best > 0) {
      this.add.text(cx, cy + 148, `BEST: ${best}`, {
        fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: act.colorHex,
      }).setOrigin(0.5);
    }

    // Play/Replay button
    const label   = done ? "↺  REPLAY" : "▶  DEPLOY";
    const btnFill = done ? 0x0a1a00 : 0x001a11;
    const playBtn = this.add.rectangle(cx, cy + 190, cw - 32, 44, btnFill)
      .setStrokeStyle(1.5, act.color, 0.75).setInteractive();
    const playTxt = this.add.text(cx, cy + 190, label, {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif",
      color: act.colorHex, fontStyle: "bold",
    }).setOrigin(0.5);

    playBtn.on("pointerover",  () => { playBtn.setAlpha(0.75); });
    playBtn.on("pointerout",   () => { playBtn.setAlpha(1); });
    playBtn.on("pointerdown",  () => {
      this.cameras.main.fade(380, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.stop("UIScene");
        this.scene.start("GameScene", { levelId });
      });
    });

    // Hover glow
    card.on("pointerover", () => card.setStrokeStyle(2, act.color, 0.75));
    card.on("pointerout",  () => card.setStrokeStyle(1.5, done ? act.color : 0x223333, done ? 0.7 : 0.4));
  }

  _buildBackButton() {
    const backBtn = this.add.rectangle(78, 36, 130, 32, 0x0a0a16)
      .setStrokeStyle(1, 0x334455, 0.6).setInteractive();
    this.add.text(78, 36, "← ACTS", {
      fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#556677",
    }).setOrigin(0.5);
    backBtn.on("pointerover",  () => backBtn.setFillStyle(0x151525));
    backBtn.on("pointerout",   () => backBtn.setFillStyle(0x0a0a16));
    backBtn.on("pointerdown",  () => {
      this.cameras.main.fade(300, 0,0,0);
      this.time.delayedCall(320, () => this.scene.start("ActHubScene"));
    });
  }
}