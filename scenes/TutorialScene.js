/**
 * TutorialScene — Scrollable field manual.
 * Uses a Phaser RenderTexture + mask approach for clipping,
 * with mouse wheel + drag scrolling.
 */

import { W, H } from "./GameScene.js";
import towersData from "../data/towers.js";
import { ENEMIES } from "../data/levels.js";

const COL_L = 60;
const COL_R = W / 2 + 40;
const COL_W = W / 2 - 80;

// Shared text styles
const S = {
  sectionHead: { fontSize: "16px", fontFamily: "'Orbitron', sans-serif",       color: "#00ffcc", fontStyle: "bold" },
  name:        { fontSize: "16px", fontFamily: "'Orbitron', sans-serif",       color: "#ffffff", fontStyle: "bold" },
  cost:        { fontSize: "15px", fontFamily: "'Orbitron', sans-serif",       color: "#ffd700", fontStyle: "bold" },
  stat:        { fontSize: "15px", fontFamily: "'Share Tech Mono', monospace", color: "#aaaaaa" },
  desc:        { fontSize: "15px", fontFamily: "'Share Tech Mono', monospace", color: "#99bbcc", lineSpacing: 3 },
  mechTitle:   { fontSize: "16px", fontFamily: "'Orbitron', sans-serif",       color: "#bbbbff", fontStyle: "bold" },
  mechDesc:    { fontSize: "15px", fontFamily: "'Share Tech Mono', monospace", color: "#8899bb", lineSpacing: 3 },
};

export default class TutorialScene extends Phaser.Scene {
  constructor() { super("TutorialScene"); }

  create() {
    // Static background (not scrolled)
    this._buildBg();
    this._buildHeader();

    // Scrollable content area
    this._contentY    = 0;        // current scroll offset
    this._contentH    = 0;        // total content height (calculated)
    this._scrollMin   = 0;
    this._scrollMax   = 0;
    this._isDragging  = false;
    this._dragStartY  = 0;
    this._dragStartScrollY = 0;

    // Content lives in a container — we move the container to scroll
    this._container = this.add.container(0, 0);
    this._buildScrollContent();

    // Clip mask: only show content between header and back button
    const clipTop    = 100;
    const clipBottom = H - 50;
    const clipH      = clipBottom - clipTop;

    const maskRect = this.add.graphics();
    maskRect.fillStyle(0xffffff);
    maskRect.fillRect(0, clipTop, W, clipH);
    maskRect.visible = false;
    const mask = maskRect.createGeometryMask();
    mask.invertAlpha = false;
    this._container.setMask(mask);

    this._scrollMax = Math.max(0, this._contentH - clipH + 20);

    // Scroll bar
    this._buildScrollbar(clipTop, clipH);

    // Input
    this.input.on("wheel",        (p, objs, dx, dy) => this._onWheel(dy));
    this.input.on("pointerdown",  (p) => this._onDragStart(p));
    this.input.on("pointermove",  (p) => this._onDragMove(p));
    this.input.on("pointerup",    ()  => this._isDragging = false);

    // Back button — static, above clip
    this._buildBackButton();
  }

  // ─── BACKGROUND ─────────────────────────────────────────────────
  _buildBg() {
    this.add.rectangle(W/2, H/2, W, H, 0x04040d);
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.04);
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
    this.add.rectangle(W/2, 46, W, 92, 0x04040d);  // opaque header bg
    this.add.text(W/2, 24, "FIELD MANUAL", {
      fontSize: "28px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5);
    this.add.text(W/2, 56, "— CHRONO COMMANDER TRAINING PROTOCOL —", {
      fontSize: "15px", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ffcc", letterSpacing: 3,
    }).setOrigin(0.5);
    const hg = this.add.graphics();
    hg.lineStyle(1, 0x00ffcc, 0.2);
    hg.lineBetween(50, 82, W-50, 82);

    // Scroll hint
    this.add.text(W - 20, 70, "↕ SCROLL", {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace", color: "#334455",
    }).setOrigin(1, 0.5);
  }

  // ─── SCROLL CONTENT ─────────────────────────────────────────────
  _buildScrollContent() {
    let y = 108; // start below header

    // ── SECTION: TOWERS ────────────────────────────────────────────
    y = this._sectionHeader(y, "[ DEFENSE UNITS ]", "#00ffcc") + 14;

    Object.entries(towersData).forEach(([type, cfg]) => {
      y = this._towerRow(y, cfg);
      y += 20;
    });

    y += 10;

    // Divider
    y = this._divider(y, "#00ffcc") + 18;

    // ── SECTION: ENEMIES ───────────────────────────────────────────
    y = this._sectionHeader(y, "[ HOSTILE UNITS ]", "#ff6677") + 14;

    Object.entries(ENEMIES).forEach(([type, cfg]) => {
      y = this._enemyRow(y, cfg);
      y += 14;
    });

    y += 10;
    y = this._divider(y, "#aaaaff") + 18;

    // ── SECTION: MECHANICS ─────────────────────────────────────────
    y = this._sectionHeader(y, "[ KEY MECHANICS ]", "#aaaaff") + 16;

    const mechanics = [
      ["◎  ORBITAL STRIKE",
       "Click the Orbital button, then click anywhere on the map.\nDeals 500 damage in a 130-unit radius. 25 second cooldown.\nSave it for boss units or clustered enemies."],
      ["▲  TOWER UPGRADES",
       "Click any placed tower to open the upgrade menu.\nTowers have 3 upgrade levels — each increases damage, range, and fire rate.\nUpgrading costs gold. Selling returns 60% of the original cost."],
      ["⚡  WAVE TIMING",
       "5 seconds between waves. Use this window to reinforce weak spots.\nPlace towers near the END of the path first — they fire the most.\nDon't spread too thin early."],
      ["⬡  ECONOMY",
       "Enemies drop gold when killed. Bosses drop significantly more.\nDon't hoard — a tower placed early earns its cost back quickly.\nOrbital strike does not cost gold."],
      ["🎯  TARGETING",
       "PULSE, STORM, TITAN towers target the enemy furthest along the path.\nAPEX (Sniper) towers target the enemy with the highest current HP.\nPlace APEX towers near the start of the path for maximum efficiency."],
      ["⏩  GAME SPEED",
       "Use the 1× / 2× speed controls (bottom right) to fast-forward cleared waves.\nDrop back to 1× when a boss or dense wave appears."],
    ];

    mechanics.forEach(([title, desc]) => {
      y = this._mechBlock(y, title, desc);
      y += 16;
    });

    y += 20;
    this._contentH = y;
  }

  // ─── CONTENT BUILDERS ────────────────────────────────────────────
  _sectionHeader(y, text, color) {
    const t = this.add.text(COL_L, y, text, { ...S.sectionHead, color });
    this._container.add(t);
    return y + 24;
  }

  _divider(y, color) {
    const g = this.add.graphics();
    g.lineStyle(1, Phaser.Display.Color.HexStringToColor(color).color, 0.2);
    g.lineBetween(50, y, W - 50, y);
    this._container.add(g);
    return y + 6;
  }

  _towerRow(y, cfg) {
    const swatch = this.add.rectangle(COL_L + 20, y + 20, 36, 36, cfg.color);
    swatch.setStrokeStyle(1.5, 0xffffff, 0.3);

    const name = this.add.text(COL_L + 52, y, cfg.name, S.name);
    const cost = this.add.text(COL_L + 52, y + 22, `⬡ ${cfg.cost}`, S.cost);
    const stat = this.add.text(COL_L + 52, y + 40, `DMG ${cfg.damage}  •  RANGE ${cfg.range}  •  ${(1000/cfg.fireRate).toFixed(1)}/s`, S.stat);
    const desc = this.add.text(COL_L + 52, y + 58, cfg.description, { ...S.desc, wordWrap: { width: W - COL_L - 80 } });

    [swatch, name, cost, stat, desc].forEach(o => this._container.add(o));
    return y + 58 + (desc.height || 20);
  }

  _enemyRow(y, cfg) {
    const dot = this.add.circle(COL_L + 18, y + 18, 16, cfg.color);
    dot.setStrokeStyle(1.5, 0xffffff, 0.25);

    const name   = this.add.text(COL_L + 46, y, cfg.name, S.name);
    const stats  = this.add.text(COL_L + 46, y + 22, `HP ${cfg.hp}  •  REWARD ⬡ ${cfg.reward}  •  Speed ${cfg.speed > 0.0001 ? "FAST" : cfg.speed > 0.00006 ? "MEDIUM" : "SLOW"}`, S.stat);
    const desc   = this.add.text(COL_L + 46, y + 40, cfg.description, { ...S.desc, wordWrap: { width: W - COL_L - 70 } });

    [dot, name, stats, desc].forEach(o => this._container.add(o));
    return y + 40 + (desc.height || 20);
  }

  _mechBlock(y, title, desc) {
    const tTxt = this.add.text(COL_L, y, title, S.mechTitle);
    const dTxt = this.add.text(COL_L, y + 22, desc, { ...S.mechDesc, wordWrap: { width: W - COL_L * 2 } });
    [tTxt, dTxt].forEach(o => this._container.add(o));
    return y + 22 + (dTxt.height || 20);
  }

  // ─── SCROLLBAR ───────────────────────────────────────────────────
  _buildScrollbar(clipTop, clipH) {
    const sbX  = W - 14;
    const sbBg = this.add.rectangle(sbX, clipTop + clipH/2, 4, clipH, 0x111122);
    this._sbThumb = this.add.rectangle(sbX, clipTop, 6, 40, 0x00ffcc, 0.5);
    this._sbThumb.setOrigin(0.5, 0);
    this._clipTop = clipTop;
    this._clipH   = clipH;
  }

  _updateScrollbar() {
    if (this._scrollMax <= 0) return;
    const frac   = this._contentY / this._scrollMax;
    const thumbH = Math.max(30, this._clipH * (this._clipH / (this._contentH || 1)));
    const travel = this._clipH - thumbH;
    this._sbThumb.y      = this._clipTop + frac * travel;
    this._sbThumb.height = thumbH;
  }

  // ─── SCROLL INPUT ────────────────────────────────────────────────
  _onWheel(dy) {
    this._setScroll(this._contentY + dy * 0.6);
  }

  _onDragStart(p) {
    this._isDragging     = true;
    this._dragStartY     = p.y;
    this._dragStartScrollY = this._contentY;
  }

  _onDragMove(p) {
    if (!this._isDragging) return;
    const delta = this._dragStartY - p.y;
    this._setScroll(this._dragStartScrollY + delta);
  }

  _setScroll(val) {
    this._contentY = Phaser.Math.Clamp(val, this._scrollMin, this._scrollMax);
    this._container.y = 100 - this._contentY;
    this._updateScrollbar();
  }

  // ─── BACK BUTTON ─────────────────────────────────────────────────
  _buildBackButton() {
    const bg = this.add.rectangle(W/2, H - 20, 200, 30, 0x04040d)
      .setStrokeStyle(0);
    // Opaque backing so content doesn't bleed under it
    this.add.rectangle(W/2, H - 26, W, 52, 0x04040d);

    const btn = this.add.rectangle(W/2, H - 22, 200, 30, 0x0a0a22)
      .setStrokeStyle(1, 0x4444ff, 0.6).setInteractive();
    const txt = this.add.text(W/2, H - 22, "← BACK TO MENU", {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#aaaaff",
    }).setOrigin(0.5);

    btn.on("pointerover",  () => btn.setFillStyle(0x1a1a44));
    btn.on("pointerout",   () => btn.setFillStyle(0x0a0a22));
    btn.on("pointerdown",  () => {
      this.cameras.main.fade(300, 0,0,0);
      this.time.delayedCall(320, () => this.scene.start("BootScene"));
    });
  }
}