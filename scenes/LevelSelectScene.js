import { W, H }   from "./GameScene.js";
import { LEVELS } from "../data/levels.js";

export default class LevelSelectScene extends Phaser.Scene {
  constructor() { super("LevelSelectScene"); }

  create() {
    // Background
    this.add.rectangle(W/2, H/2, W, H, 0x04040d);
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.04);
    for (let x=0;x<=W;x+=50) g.lineBetween(x,0,x,H);
    for (let y=0;y<=H;y+=50) g.lineBetween(0,y,W,y);
    g.lineStyle(2, 0x00ffcc, 0.28);
    const cs = 28;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx=cx===0?1:-1, dy=cy===0?1:-1;
      g.lineBetween(cx,cy,cx+dx*cs,cy); g.lineBetween(cx,cy,cx,cy+dy*cs);
    });

    // Header
    this.add.text(W/2, 46, "SELECT MISSION", {
      fontSize: "30px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5);

    this.add.text(W/2, 80, "— CHOOSE YOUR BATTLEFIELD —", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ffcc", letterSpacing: 4,
    }).setOrigin(0.5);

    // Level cards — spaced evenly
    const cardSpacing = Math.min(360, (W - 80) / LEVELS.length);
    const totalW = cardSpacing * (LEVELS.length - 1);
    LEVELS.forEach((level, i) => {
      const cardX = W/2 - totalW/2 + i * cardSpacing;
      this._buildLevelCard(cardX, H/2 + 16, level);
    });

    // Back button
    const backBtn = this.add.rectangle(78, 38, 130, 34, 0x0a0a22)
      .setStrokeStyle(1, 0x334455, 0.8).setInteractive();
    this.add.text(78, 38, "← MENU", {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#778899",
    }).setOrigin(0.5);
    backBtn.on("pointerover",  () => backBtn.setFillStyle(0x151525));
    backBtn.on("pointerout",   () => backBtn.setFillStyle(0x0a0a22));
    backBtn.on("pointerdown",  () => {
      this.cameras.main.fade(300, 0,0,0);
      this.time.delayedCall(320, () => this.scene.start("BootScene"));
    });
  }

  _buildLevelCard(cx, cy, level) {
    const cw = 320, ch = 440;

    // Card background + border
    const card = this.add.rectangle(cx, cy, cw, ch, 0x07070f);
    card.setStrokeStyle(1.5, 0x00ffcc, 0.3).setInteractive();

    // Level number badge
    this.add.circle(cx, cy - 180, 30, 0x001a1a)
      .setStrokeStyle(2, 0x00ffcc, 0.55);
    this.add.text(cx, cy - 180, `${level.id}`, {
      fontSize: "22px", fontFamily: "'Orbitron', sans-serif",
      color: "#00ffcc", fontStyle: "bold",
    }).setOrigin(0.5);

    // Level name
    this.add.text(cx, cy - 130, level.name, {
      fontSize: "19px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 104, level.subtitle, {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ddbb",
    }).setOrigin(0.5);

    // Thin rule
    const dg = this.add.graphics();
    dg.lineStyle(1, 0x00ffcc, 0.15);
    dg.lineBetween(cx - cw/2 + 20, cy - 84, cx + cw/2 - 20, cy - 84);

    // Lore — significantly more readable
    this.add.text(cx, cy - 68, level.lore, {
      fontSize: "13px",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#aabbcc",          // bright enough to read clearly
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: cw - 50 },
    }).setOrigin(0.5, 0);

    // Stats strip
    const sy = cy + 118;
    dg.lineBetween(cx - cw/2 + 20, sy - 12, cx + cw/2 - 20, sy - 12);

    this.add.text(cx - 90, sy, `${level.waves.length} WAVES`, {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#778899",
    }).setOrigin(0.5);
    this.add.text(cx, sy, `⬡ ${level.startGold}`, {
      fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#ccaa00",
    }).setOrigin(0.5);
    this.add.text(cx + 90, sy, `HP ${level.baseHP}`, {
      fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#cc6666",
    }).setOrigin(0.5);

    // Play button
    const playBtn = this.add.rectangle(cx, cy + 178, cw - 40, 48, 0x001a11)
      .setStrokeStyle(2, 0x00ff66, 0.65).setInteractive();
    const playTxt = this.add.text(cx, cy + 178, `▶  DEPLOY`, {
      fontSize: "14px", fontFamily: "'Orbitron', sans-serif",
      color: "#00ff88", fontStyle: "bold",
    }).setOrigin(0.5);

    playBtn.on("pointerover",  () => { playBtn.setFillStyle(0x003322); playTxt.setColor("#00ffaa"); });
    playBtn.on("pointerout",   () => { playBtn.setFillStyle(0x001a11); playTxt.setColor("#00ff88"); });
    playBtn.on("pointerdown",  () => {
      this.cameras.main.fade(400, 0,0,0);
      this.time.delayedCall(420, () => {
        this.scene.stop("UIScene");
        this.scene.start("GameScene", { levelId: level.id });
      });
    });

    // Card hover glow
    card.on("pointerover", () => card.setStrokeStyle(2, 0x00ffcc, 0.7));
    card.on("pointerout",  () => card.setStrokeStyle(1.5, 0x00ffcc, 0.3));
  }
}