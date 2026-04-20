import { W, H }    from "./GameScene.js";
import { ACTS, GAME_TITLE, GAME_SUBTITLE } from "../data/story.js";
import SaveManager  from "../managers/SaveManager.js";

const CARD_W    = 260;
const CARD_H    = 420;
const CARD_GAP  = 28;
const CARD_STEP = CARD_W + CARD_GAP;
// Card 0 world-centre = W/2, so scrollX=0 shows it centred
const LAYOUT_OFFSET = W / 2;
const MAX_SCROLL    = (ACTS.length - 1) * CARD_STEP;

export default class ActHubScene extends Phaser.Scene {
  constructor() { super("ActHubScene"); }

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
    this._refreshUI();
  }

  // ─── BG ─────────────────────────────────────────────────────────
  _buildBg() {
    const totalW = LAYOUT_OFFSET + ACTS.length * CARD_STEP + W;
    this.add.rectangle(totalW / 2, H / 2, totalW, H, 0x020208);
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.035);
    for (let x = 0; x <= totalW; x += 50) g.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 50)       g.lineBetween(0, y, totalW, y);
    // Corner brackets — scrollFactor(0) so they stay on screen
    const cg = this.add.graphics().setScrollFactor(0).setDepth(1);
    cg.lineStyle(2, 0x00ffcc, 0.22);
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx=cx===0?1:-1, dy=cy===0?1:-1;
      cg.lineBetween(cx,cy,cx+28*dx,cy); cg.lineBetween(cx,cy,cx,cy+28*dy);
    });
  }

  // ─── CARDS ──────────────────────────────────────────────────────
  _buildAllCards(save) {
    ACTS.forEach((act, i) => {
      const cx = LAYOUT_OFFSET + i * CARD_STEP;
      const cy = H / 2 + 14;
      const completed = act.levelIds.filter(id => save.completed.includes(id)).length;

      // Act 1 always unlocked. Each subsequent act unlocks only when
      // ALL levels of the previous act are completed.
      let unlocked;
      if (i === 0) {
        unlocked = true;
      } else {
        const prevAct = ACTS[i - 1];
        unlocked = prevAct.levelIds.every(id => save.completed.includes(id));
      }

      const complete = completed >= act.levelIds.length;
      this._buildCard(cx, cy, act, unlocked, complete, completed, save);
    });
  }

  _buildCard(cx, cy, act, isUnlocked, isComplete, levelsCompleted, save) {
    const cw = CARD_W, ch = CARD_H;
    const alpha = isUnlocked ? 1 : 0.35;

    this.add.rectangle(cx, cy, cw, ch, 0x06060e).setAlpha(alpha)
      .setStrokeStyle(1.5,
        isComplete ? act.color : (isUnlocked ? 0x334444 : 0x111122),
        isComplete ? 0.8 : (isUnlocked ? 0.45 : 0.25));

    this.add.rectangle(cx, cy - ch/2 + 5, cw-2, 6, act.color,
      isUnlocked ? 0.65 : 0.15);

    this.add.text(cx, cy - ch/2 + 28, `ACT ${act.id}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? act.colorHex : "#334444",
    }).setOrigin(0.5).setAlpha(alpha);

    this.add.text(cx, cy - ch/2 + 58, act.name, {
      fontSize: "17px", fontFamily: "'Orbitron', sans-serif",
      color: isUnlocked ? "#ffffff" : "#445555", fontStyle: "bold",
      wordWrap: { width: cw-20 }, align: "center",
    }).setOrigin(0.5).setAlpha(alpha);

    this.add.text(cx, cy - ch/2 + 94, act.tagline, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? "#778899" : "#334444",
      wordWrap: { width: cw-24 }, align: "center",
    }).setOrigin(0.5).setAlpha(alpha);

    const dg = this.add.graphics();
    dg.lineStyle(1, act.color, isUnlocked ? 0.2 : 0.07);
    dg.lineBetween(cx-cw/2+16, cy-ch/2+116, cx+cw/2-16, cy-ch/2+116);

    this.add.text(cx, cy-ch/2+130, act.theme.toUpperCase(), {
      fontSize: "10px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? act.colorHex : "#223333", letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(alpha * 0.6);

    // Level dots
    act.levelIds.forEach((levelId, j) => {
      const ox = (j - (act.levelIds.length-1)/2) * 22;
      const done = save.completed.includes(levelId);
      this.add.circle(cx+ox, cy-ch/2+162, 7, done ? act.color : 0x1a2233, alpha)
        .setStrokeStyle(1, isUnlocked ? act.color : 0x334444, 0.5);
      if (done) this.add.text(cx+ox, cy-ch/2+162, "✓", {
        fontSize: "9px", fontFamily: "'Share Tech Mono', monospace", color: "#000",
      }).setOrigin(0.5);
    });

    this.add.text(cx, cy-ch/2+188, `${levelsCompleted} / ${act.levelIds.length} MISSIONS`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
      color: isUnlocked ? "#556677" : "#334444",
    }).setOrigin(0.5).setAlpha(alpha);

    const btnY = cy + ch/2 - 40;
    if (!isUnlocked) {
      this.add.rectangle(cx, btnY, cw-30, 44, 0x0a0a14).setStrokeStyle(1, 0x334444, 0.4);
      this.add.text(cx, btnY-8, "🔒  LOCKED", {
        fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#334455",
      }).setOrigin(0.5);
      // Tell the player exactly what they need to do
      const actIndex = ACTS.indexOf(act);
      const prevAct  = ACTS[actIndex - 1];
      const remaining = prevAct
        ? prevAct.levelIds.filter(id => !save.completed.includes(id)).length
        : 0;
      this.add.text(cx, btnY+10,
        `Finish Act ${prevAct?.id}: ${remaining} mission${remaining!==1?"s":""} left`, {
        fontSize: "10px", fontFamily: "'Share Tech Mono', monospace", color: "#334444",
      }).setOrigin(0.5);
    } else if (isComplete) {
      this.add.rectangle(cx, btnY, cw-30, 44, 0x001a00).setStrokeStyle(1.5, act.color, 0.6);
      this.add.text(cx, btnY, "✓  COMPLETED", {
        fontSize: "14px", fontFamily: "'Orbitron', sans-serif", color: act.colorHex,
      }).setOrigin(0.5);
    } else {
      const btn = this.add.rectangle(cx, btnY, cw-30, 44, 0x001a11)
        .setStrokeStyle(1.5, act.color, 0.75).setInteractive();
      this.add.text(cx, btnY, "▶  ENTER", {
        fontSize: "14px", fontFamily: "'Orbitron', sans-serif",
        color: act.colorHex, fontStyle: "bold",
      }).setOrigin(0.5);
      btn.on("pointerover",  () => btn.setFillStyle(0x003322));
      btn.on("pointerout",   () => btn.setFillStyle(0x001a11));
      btn.on("pointerup",    () => { if (!this._wasDragging) this._enterAct(act, save); });
    }
  }

  _enterAct(act, save) {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(420, () => {
      const started = act.levelIds.some(id => save.completed.includes(id));
      this.scene.start(started ? "LevelSelectScene" : "CinematicScene",
        started ? { actId: act.id }
                : { act, nextScene: "LevelSelectScene", nextData: { actId: act.id } });
    });
  }

  // ─── UI (setScrollFactor(0) = fixed on screen) ──────────────────
  _buildUI(save) {
    // Header strip
    this.add.rectangle(W/2, 46, W, 92, 0x020208).setScrollFactor(0).setDepth(20);
    this.add.text(W/2, 30, GAME_TITLE, {
      fontSize: "22px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "900", stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    this.add.text(W/2, 56, GAME_SUBTITLE, {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ffcc", letterSpacing: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    const hg = this.add.graphics().setScrollFactor(0).setDepth(21);
    hg.lineStyle(1, 0x00ffcc, 0.15);
    hg.lineBetween(60, 74, W-60, 74);
    this.add.text(W/2, 84, "— CAMPAIGN TIMELINE —", {
      fontSize: "10px", fontFamily: "'Share Tech Mono', monospace",
      color: "#334455", letterSpacing: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

    // Edge covers
    this.add.rectangle(36,   H/2, 72, H, 0x020208).setScrollFactor(0).setDepth(20);
    this.add.rectangle(W-36, H/2, 72, H, 0x020208).setScrollFactor(0).setDepth(20);

    this._leftArrow  = this.add.text(28,   H/2, "‹", {
      fontSize: "44px", fontFamily: "'Orbitron', sans-serif", color: "#00ffcc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);
    this._rightArrow = this.add.text(W-28, H/2, "›", {
      fontSize: "44px", fontFamily: "'Orbitron', sans-serif", color: "#00ffcc",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(22);

    // Nav dots — arc() supports setRadius()
    this._dots = ACTS.map((_, i) => {
      const x = W/2 + (i-(ACTS.length-1)/2)*20;
      return this.add.arc(x, H-22, 4, 0, 360, false, 0x00ffcc, 0.3)
        .setScrollFactor(0).setDepth(22);
    });

    // Footer
    this.add.rectangle(W/2, H-12, W, 24, 0x020208).setScrollFactor(0).setDepth(20);
    const total = ACTS.reduce((s,a) => s+a.levelIds.length, 0);
    this.add.text(W/2, H-11,
      `PROGRESS: ${save.completed.length} / ${total}  •  SCORE: ${save.totalScore}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#334455",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

    // Back button
    const backBtn = this.add.rectangle(78, 36, 130, 32, 0x0a0a16)
      .setStrokeStyle(1, 0x334455, 0.6).setInteractive().setScrollFactor(0).setDepth(22);
    this.add.text(78, 36, "← MENU", {
      fontSize: "12px", fontFamily: "'Orbitron', sans-serif", color: "#556677",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(23);
    backBtn.on("pointerover",  () => backBtn.setFillStyle(0x151525));
    backBtn.on("pointerout",   () => backBtn.setFillStyle(0x0a0a16));
    backBtn.on("pointerdown",  () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(320, () => this.scene.start("BootScene"));
    });
  }

  _refreshUI() {
    if (!this._leftArrow) return;
    this._leftArrow.setAlpha(this._currentCard <= 0 ? 0.12 : 0.6);
    this._rightArrow.setAlpha(this._currentCard >= ACTS.length-1 ? 0.12 : 0.6);
    this._dots?.forEach((d, i) => {
      d.setAlpha(i === this._currentCard ? 1 : 0.3);
      d.setRadius(i === this._currentCard ? 6 : 4);
    });
  }

  // ─── INPUT ───────────────────────────────────────────────────────
  _setupInput() {
    this.input.on("pointerdown", (p) => {
      // Kill any running tween so camera.scrollX is stable before drag
      this.tweens.killTweensOf(this.cameras.main);
      this._dragStartX       = p.x;
      this._dragStartScrollX = this.cameras.main.scrollX;
      this._wasDragging      = false;
    });

    this.input.on("pointermove", (p) => {
      if (!p.isDown) return;
      const dx = this._dragStartX - p.x;   // drag left → scrollX increases
      if (Math.abs(dx) > 8) this._wasDragging = true;
      if (this._wasDragging) {
        this.cameras.main.scrollX = Phaser.Math.Clamp(
          this._dragStartScrollX + dx, 0, MAX_SCROLL);
      }
    });

    this.input.on("pointerup", () => {
      if (this._wasDragging) this._snapCamera();
      this.time.delayedCall(60, () => { this._wasDragging = false; });
    });

    // Wheel on the canvas element — always fires
    const onWheel = (e) => {
      e.preventDefault();
      this.tweens.killTweensOf(this.cameras.main);
      this._currentCard = Phaser.Math.Clamp(
        this._currentCard + Math.sign(e.deltaY), 0, ACTS.length-1);
      this._snapCamera();
    };
    this.game.canvas.addEventListener("wheel", onWheel, { passive: false });
    this.events.once("shutdown", () => this.game.canvas.removeEventListener("wheel", onWheel));

    // Arrow keys
    const keys = this.input.keyboard.createCursorKeys();
    keys.left.on("down", () => {
      this.tweens.killTweensOf(this.cameras.main);
      this._currentCard = Math.max(0, this._currentCard-1); this._snapCamera();
    });
    keys.right.on("down", () => {
      this.tweens.killTweensOf(this.cameras.main);
      this._currentCard = Math.min(ACTS.length-1, this._currentCard+1); this._snapCamera();
    });
  }

  _snapCamera() {
    // Decide nearest card from current scroll position
    const nearest = Phaser.Math.Clamp(
      Math.round(this.cameras.main.scrollX / CARD_STEP), 0, ACTS.length-1);
    this._currentCard = nearest;
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: this._currentCard * CARD_STEP,
      duration: 300, ease: "Quad.Out",
      onUpdate:  () => this._refreshUI(),
      onComplete:() => this._refreshUI(),
    });
  }
}