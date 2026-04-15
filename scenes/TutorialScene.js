import { W, H } from "./GameScene.js";
import towersData from "../data/towers.js";
import { ENEMIES } from "../data/levels.js";

// Readable text styles — defined once, used everywhere
const T = {
  heading:  { fontSize: "13px", fontFamily: "'Orbitron', sans-serif",        color: "#00ffcc", fontStyle: "bold" },
  name:     { fontSize: "15px", fontFamily: "'Orbitron', sans-serif",        color: "#ffffff", fontStyle: "bold" },
  cost:     { fontSize: "13px", fontFamily: "'Orbitron', sans-serif",        color: "#ffd700", fontStyle: "bold" },
  stat:     { fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",  color: "#aaaaaa" },
  desc:     { fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",  color: "#99aaaa" },
  mechTitle:{ fontSize: "12px", fontFamily: "'Orbitron', sans-serif",        color: "#bbbbff", fontStyle: "bold" },
  mechDesc: { fontSize: "12px", fontFamily: "'Share Tech Mono', monospace",  color: "#8899aa" },
  label:    { fontSize: "12px", fontFamily: "'Orbitron', sans-serif",        color: "#aaaaff" },
};

export default class TutorialScene extends Phaser.Scene {
  constructor() { super("TutorialScene"); }

  create() {
    this._buildBg();
    this._buildContent();
  }

  _buildBg() {
    this.add.rectangle(W/2, H/2, W, H, 0x04040d);
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.04);
    for (let x = 0; x <= W; x += 50) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 50) g.lineBetween(0, y, W, y);
    g.lineStyle(2, 0x00ffcc, 0.28);
    const cs = 28;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx = cx===0?1:-1, dy = cy===0?1:-1;
      g.lineBetween(cx,cy,cx+dx*cs,cy); g.lineBetween(cx,cy,cx,cy+dy*cs);
    });
  }

  _buildContent() {
    // ── HEADER ──────────────────────────────────────────────────
    this.add.text(W/2, 36, "FIELD MANUAL", {
      fontSize: "30px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5);

    this.add.text(W/2, 70, "— DEFENSE PROTOCOLS —", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ffcc", letterSpacing: 4,
    }).setOrigin(0.5);

    const dg = this.add.graphics();
    dg.lineStyle(1, 0x00ffcc, 0.18);
    dg.lineBetween(50, 90, W-50, 90);

    // ── TWO COLUMNS ─────────────────────────────────────────────
    const leftX  = 60;
    const rightX = W/2 + 40;
    const colW   = W/2 - 80;

    // Column headers
    this.add.text(leftX,  106, "[ DEFENSE UNITS ]",  T.heading);
    this.add.text(rightX, 106, "[ HOSTILE UNITS ]",
      { ...T.heading, color: "#ff6677" });

    // ── TOWERS (left col) ────────────────────────────────────────
    const towers = Object.entries(towersData);
    const towerRowH = Math.min(108, (H - 240) / towers.length); // auto-fit

    towers.forEach(([type, cfg], i) => {
      const ry = 134 + i * towerRowH;

      // Swatch
      this.add.rectangle(leftX + 18, ry + 18, 32, 32, cfg.color)
        .setStrokeStyle(1.5, 0xffffff, 0.35);

      // Name
      this.add.text(leftX + 44, ry, cfg.name, T.name);

      // Cost + rate on same line
      this.add.text(leftX + 44, ry + 20, `⬡ ${cfg.cost}`, T.cost);

      // Stats row
      this.add.text(leftX + 44, ry + 38,
        `DMG ${cfg.damage}   RANGE ${cfg.range}   ${(1000/cfg.fireRate).toFixed(1)}/s`,
        T.stat);

      // Description — proper bright colour
      this.add.text(leftX + 44, ry + 56, cfg.description, {
        ...T.desc, wordWrap: { width: colW - 50 },
      });
    });

    // ── ENEMIES (right col) ──────────────────────────────────────
    const enemies  = Object.entries(ENEMIES);
    const enemyRowH = Math.min(100, (H - 240) / enemies.length);

    enemies.forEach(([type, cfg], i) => {
      const ry = 134 + i * enemyRowH;

      // Dot
      this.add.circle(rightX + 14, ry + 16, 13, cfg.color)
        .setStrokeStyle(1.5, 0xffffff, 0.25);

      // Name
      this.add.text(rightX + 36, ry, cfg.name, T.name);

      // HP + reward
      this.add.text(rightX + 36, ry + 20,
        `HP ${cfg.hp}   REWARD ⬡ ${cfg.reward}`,
        T.stat);

      // Description
      this.add.text(rightX + 36, ry + 38, cfg.description, {
        ...T.desc, wordWrap: { width: colW - 44 },
      });
    });

    // ── DIVIDER before mechanics ─────────────────────────────────
    const mechY = H - 162;
    dg.lineBetween(50, mechY, W-50, mechY);
    this.add.text(W/2, mechY + 10, "[ KEY MECHANICS ]", T.heading).setOrigin(0.5);

    const mechanics = [
      ["◎  ORBITAL STRIKE", "Click the orbital button then click the map. Massive AoE. 25s cooldown."],
      ["▲  UPGRADES",       "Click any tower: upgrade (3 levels) or sell for 60% refund."],
      ["⚡  WAVE PACING",   "5 seconds between waves. Use it — place towers near the path end first."],
      ["⬡  ECONOMY",       "Enemies drop gold on death. Invest early, upgrade mid-game."],
    ];

    mechanics.forEach(([title, desc], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const mx = 80 + col * (W/2);
      const my = mechY + 34 + row * 52;
      this.add.text(mx, my,      title, T.mechTitle);
      this.add.text(mx, my + 17, desc,  { ...T.mechDesc, wordWrap: { width: W/2 - 100 } });
    });

    // ── BACK BUTTON ─────────────────────────────────────────────
    const backBtn = this.add.rectangle(W/2, H - 18, 200, 28, 0x0a0a22)
      .setStrokeStyle(1, 0x4444ff, 0.6).setInteractive();
    this.add.text(W/2, H - 18, "← BACK TO MENU", T.label).setOrigin(0.5);

    backBtn.on("pointerover",  () => backBtn.setFillStyle(0x1a1a44));
    backBtn.on("pointerout",   () => backBtn.setFillStyle(0x0a0a22));
    backBtn.on("pointerdown",  () => {
      this.cameras.main.fade(300, 0,0,0);
      this.time.delayedCall(320, () => this.scene.start("BootScene"));
    });
  }
}