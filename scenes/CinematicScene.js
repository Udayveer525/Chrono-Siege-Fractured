/**
 * CinematicScene — Plays a scripted act cinematic then transitions.
 * Receives: { act, onComplete: sceneName }
 * 
 * Beat types:
 *   title  — large centred act title, fades in/out
 *   line   — normal narrative line, typewriter effect
 *   impact — high-contrast "shock" line, larger + coloured
 *   pause  — silent wait
 *   prompt — "press to continue" button, ends cinematic
 */

import { W, H, COLORS } from "./GameScene.js";

export default class CinematicScene extends Phaser.Scene {
  constructor() { super("CinematicScene"); }

  init(data) {
    this.act        = data.act;
    this.nextScene  = data.nextScene  || "ActHubScene";
    this.nextData   = data.nextData   || {};
    this._skipped   = false;
  }

  create() {
    // Full black base
    this.add.rectangle(W/2, H/2, W, H, 0x000000);

    // Letterbox bars
    const barH = 68;
    this._topBar = this.add.rectangle(W/2, barH/2,      W, barH, 0x000000).setDepth(10);
    this._botBar = this.add.rectangle(W/2, H - barH/2,  W, barH, 0x000000).setDepth(10);

    // Skip hint
    this._skipHint = this.add.text(W - 20, H - barH/2, "SPACE / CLICK TO SKIP", {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#333333",
    }).setOrigin(1, 0.5).setDepth(11);

    // Animated background — slow particle drift
    this._buildParticles();

    // Subtle act colour glow at centre
    const actColor = this.act.color;
    const glow = this.add.circle(W/2, H/2, 200, actColor, 0).setDepth(1);
    this.tweens.add({ targets: glow, alpha: 0.04, duration: 3000, yoyo: true, repeat: -1 });

    // Line container — centred in the safe area between letterboxes
    this._lineY    = H / 2 - 60;  // start position for first line
    this._lines    = [];           // active text objects
    this._running  = true;

    // Global skip
    this.input.keyboard.on("keydown-SPACE", () => this._skip());
    this.input.on("pointerdown", () => this._skip());

    // Play the script
    this._playScript(this.act.cinematic, 0);
  }

  _buildParticles() {
    for (let i = 0; i < 22; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(80, H - 80);
      const dot = this.add.circle(x, y, Phaser.Math.Between(1,2), this.act.color,
        Phaser.Math.FloatBetween(0.04, 0.15)).setDepth(2);
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(20, 60),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 7000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => { dot.y = y; dot.alpha = Phaser.Math.FloatBetween(0.04, 0.15); },
      });
    }
  }

  // ─── SCRIPT PLAYER ──────────────────────────────────────────────
  _playScript(beats, index) {
    if (!this._running || index >= beats.length) return;

    const beat = beats[index];
    const next = () => {
      if (!this._running) return;
      this.time.delayedCall(120, () => this._playScript(beats, index + 1));
    };

    switch (beat.type) {
      case "title":  this._beatTitle(beat, next);  break;
      case "line":   this._beatLine(beat, next);   break;
      case "impact": this._beatImpact(beat, next); break;
      case "pause":  this.time.delayedCall(beat.duration, next); break;
      case "prompt": this._beatPrompt(beat);        break;
      default:       next();
    }
  }

  _beatTitle(beat, next) {
    // Clear previous lines
    this._clearLines();
    this._lineY = H/2 - 20;

    const txt = this.add.text(W/2, H/2, beat.text, {
      fontSize: "52px", fontFamily: "'Orbitron', sans-serif",
      color: this.act.colorHex, fontStyle: "bold",
      stroke: "#000000", strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0).setDepth(5);

    this._lines.push(txt);

    this.tweens.add({
      targets: txt, alpha: 1, y: H/2 - 6, duration: 600, ease: "Quad.Out",
      onComplete: () => {
        this.time.delayedCall(beat.duration, () => {
          this.tweens.add({ targets: txt, alpha: 0, duration: 500, onComplete: next });
        });
      },
    });
  }

  _beatLine(beat, next) {
    // Scroll existing lines up
    this._lines.forEach(l => {
      this.tweens.add({ targets: l, y: l.y - 32, alpha: l.alpha * 0.55, duration: 300 });
    });

    const txt = this.add.text(W/2, this._lineY + 24, "", {
      fontSize: "18px", fontFamily: "'Share Tech Mono', monospace",
      color: "#ccdddd", align: "center",
    }).setOrigin(0.5).setAlpha(0).setDepth(5);

    this._lines.push(txt);
    if (this._lines.length > 6) {
      const old = this._lines.shift();
      this.tweens.add({ targets: old, alpha: 0, duration: 200, onComplete: () => old.destroy() });
    }

    // Typewriter
    this.tweens.add({ targets: txt, alpha: 1, duration: 200 });
    this._typewriter(txt, beat.text, 32, () => {
      this.time.delayedCall(beat.duration - beat.text.length * 32, next);
    });
  }

  _beatImpact(beat, next) {
    this._clearLines();
    this._lineY = H/2 - 20;

    // Flash
    const flash = this.add.rectangle(W/2, H/2, W, H, 0xffffff, 0).setDepth(8);
    this.tweens.add({ targets: flash, alpha: 0.12, duration: 80, yoyo: true,
      onComplete: () => flash.destroy() });

    const txt = this.add.text(W/2, H/2 + 10, beat.text, {
      fontSize: "32px", fontFamily: "'Orbitron', sans-serif",
      color: this.act.colorHex, fontStyle: "bold",
      stroke: "#000000", strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: this.act.colorHex, blur: 20, fill: true },
    }).setOrigin(0.5).setAlpha(0).setDepth(5).setScale(1.3);

    this._lines.push(txt);
    this.tweens.add({
      targets: txt, alpha: 1, scaleX: 1, scaleY: 1, duration: 350, ease: "Back.Out",
      onComplete: () => this.time.delayedCall(beat.duration, next),
    });

    // Camera shake
    this.cameras.main.shake(400, 0.008);
  }

  _beatPrompt(beat) {
    // Stop skipping on click (we need click for prompt)
    this.input.off("pointerdown");
    this.input.keyboard.off("keydown-SPACE");

    const btn = this.add.rectangle(W/2, H - 48, 240, 42, 0x000000)
      .setStrokeStyle(1.5, this.act.color, 0.8).setInteractive().setDepth(11);
    const txt = this.add.text(W/2, H - 48, beat.text, {
      fontSize: "14px", fontFamily: "'Orbitron', sans-serif",
      color: this.act.colorHex, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(12);

    // Pulse
    this.tweens.add({ targets: [btn, txt], alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });

    btn.on("pointerdown", () => this._finish());
    txt.on("pointerdown", () => this._finish());
    // Also allow space
    this.input.keyboard.once("keydown-SPACE", () => this._finish());
  }

  _skip() {
    if (!this._running) return;
    this._running = false;
    this._finish();
  }

  _finish() {
    this._running = false;
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(520, () => {
      this.scene.start(this.nextScene, this.nextData);
    });
  }

  _clearLines() {
    this._lines.forEach(l => {
      this.tweens.add({ targets: l, alpha: 0, duration: 250, onComplete: () => l.destroy() });
    });
    this._lines = [];
    this._lineY = H/2 - 60;
  }

  _typewriter(textObj, fullText, charDelay, onDone) {
    let i = 0;
    const timer = this.time.addEvent({
      delay: charDelay,
      repeat: fullText.length - 1,
      callback: () => {
        if (!this._running) { textObj.setText(fullText); timer.remove(); onDone?.(); return; }
        textObj.setText(fullText.slice(0, ++i));
        if (i >= fullText.length) onDone?.();
      },
    });
  }
}