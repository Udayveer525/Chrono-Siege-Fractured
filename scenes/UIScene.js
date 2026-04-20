/**
 * UIScene — runs in parallel over GameScene.
 * Owns all HUD elements: stats panel, wave status, orbital button,
 * speed controls, and the HTML tooltip.
 * Communicates via GameScene's event emitter.
 */

import { W, H } from "./GameScene.js";

export default class UIScene extends Phaser.Scene {
  constructor() { super("UIScene"); }

  init(data) {
    this.gameScene = data.gameScene;
  }

  create() {
    this._buildStatsPanel();
    this._buildWaveStatusBar();
    this._buildOrbitalButton();
    this._buildSpeedControls();
    this._setupTooltip();

    // Listen to GameScene events
    const gs = this.gameScene;
    gs.events.on("goldUpdate",           (v)    => this.goldText.setText(`${v}`));
    gs.events.on("scoreUpdate",          (v)    => this.scoreText.setText(`${v}`));
    gs.events.on("hpUpdate",             (hp,max) => this.hpText.setText(`${hp}/${max}`));
    gs.events.on("waveUpdate",           (n)    => this.waveText.setText(`WAVE  ${n}`));
    gs.events.on("waveStatus",           (t)    => this.waveStatusText.setText(t));
    gs.events.on("orbitalCooldownStart", ()     => this._onOrbitalCooldownStart());
    gs.events.on("orbitalReady",         ()     => this._onOrbitalReady());
    gs.events.on("showTooltip",          (cfg)  => this._showTooltip(cfg));
    gs.events.on("hideTooltip",          ()     => this._hideTooltip());
  }

  update() {
    // Animate orbital cooldown bar
    const gs = this.gameScene;
    if (gs && !gs.orbitalReady) {
      const p = gs.orbitalCooldownProgress();
      this.orbitalCdBar.width = 124 * p;
      const secs = Math.ceil((1 - p) * gs.orbitalCooldown / 1000);
      this.orbitalCdText.setText(secs > 0 ? `${secs}s` : "READY");
    }
  }

  // ─── STATS PANEL (top-left) ──────────────────────────────────────
  _buildStatsPanel() {
    const px = 10, py = 10, pw = 200, ph = 120;

    this.add.rectangle(px + pw/2, py + ph/2, pw, ph, 0x000000, 0.7)
      .setStrokeStyle(1, 0x00ffcc, 0.35);

    // Wave
    this.waveText = this.add.text(px+14, py+10, "WAVE  1", {
      fontSize: "16px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
    });

    // HP
    this.add.text(px+14, py+38, "HP", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#ff8888",
    });
    this.hpText = this.add.text(px+48, py+36, `${this.gameScene.baseHP}/${this.gameScene.maxBaseHP}`, {
      fontSize: "15px", fontFamily: "'Orbitron', sans-serif", color: "#ff4444", fontStyle: "bold",
    });

    // Gold
    this.add.text(px+14, py+63, "⬡", { fontSize: "15px", color: "#ffd700" });
    this.goldText = this.add.text(px+36, py+62, `${this.gameScene.gold}`, {
      fontSize: "16px", fontFamily: "'Orbitron', sans-serif", color: "#ffd700", fontStyle: "bold",
    });

    // Score
    this.add.text(px+14, py+91, "SCORE", {
      fontSize: "10px", fontFamily: "'Share Tech Mono', monospace", color: "#555",
    });
    this.scoreText = this.add.text(px+72, py+89, "0", {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#9999ff",
    });
  }

  // ─── WAVE STATUS BAR (bottom-center) ────────────────────────────
  _buildWaveStatusBar() {
    this.add.rectangle(W/2, H-14, 620, 24, 0x000000, 0.6)
      .setStrokeStyle(1, 0x00ffcc, 0.2);
    this.waveStatusText = this.add.text(W/2, H-14, "", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#00ffcc",
    }).setOrigin(0.5);
  }

  // ─── ORBITAL BUTTON (bottom-right) ──────────────────────────────
  _buildOrbitalButton() {
    const bx = W - 88, by = H - 54;

    this.add.rectangle(bx, by, 152, 66, 0x000000, 0.75)
      .setStrokeStyle(1, 0x4444aa, 0.6);

    this.orbitalBtn = this.add.rectangle(bx, by, 150, 64, 0x0d0d44).setInteractive();

    this.orbitalBtnLabel = this.add.text(bx, by - 14, "◎  ORBITAL STRIKE", {
      fontSize: "11px", fontFamily: "'Orbitron', sans-serif",
      color: "#8888ff", fontStyle: "bold",
    }).setOrigin(0.5);

    this.orbitalCdText = this.add.text(bx, by + 2, "READY", {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#aaaaff",
    }).setOrigin(0.5);

    // Cooldown bar
    this.add.rectangle(bx, by + 18, 124, 5, 0x111133);
    this.orbitalCdBar = this.add.rectangle(bx - 62, by + 18, 0, 5, 0x4455ff);
    this.orbitalCdBar.setOrigin(0, 0.5);

    this.orbitalBtn.on("pointerover", () => {
      if (this.gameScene.orbitalReady) this.orbitalBtn.setFillStyle(0x1a1a66);
    });
    this.orbitalBtn.on("pointerout", () => {
      this.orbitalBtn.setFillStyle(this.gameScene.orbitalReady ? 0x0d0d44 : 0x060618);
    });
    this.orbitalBtn.on("pointerdown", () => {
      if (!this.gameScene.orbitalReady || this.gameScene.gameOver) return;
      this.gameScene.activateOrbitalMode();
    });
  }

  _onOrbitalCooldownStart() {
    this.orbitalBtn.setFillStyle(0x060618);
    this.orbitalBtnLabel.setColor("#334466");
    this.orbitalCdText.setText("CHARGING...");
  }

  _onOrbitalReady() {
    this.orbitalBtn.setFillStyle(0x0d0d44);
    this.orbitalBtnLabel.setColor("#8888ff");
    this.orbitalCdText.setText("READY");
    this.orbitalCdBar.width = 0;
  }

  // ─── SPEED CONTROLS (bottom-right, above orbital) ───────────────
  _buildSpeedControls() {
    const by = H - 112, bx = W - 88;

    this.add.rectangle(bx, by, 152, 28, 0x000000, 0.6)
      .setStrokeStyle(1, 0x00ffcc, 0.2);

    this.add.text(bx - 52, by, "SPEED", {
      fontSize: "9px", fontFamily: "'Share Tech Mono', monospace", color: "#446655",
    }).setOrigin(0.5);

    this._speedBtns = [];
    [[1, "1×", bx + 4], [2, "2×", bx + 52]].forEach(([s, label, x]) => {
      const btn = this.add.rectangle(x, by, 40, 20, s === 1 ? 0x002222 : 0x001111)
        .setInteractive().setStrokeStyle(1, 0x00ffcc, 0.3);
      const txt = this.add.text(x, by, label, {
        fontSize: "11px", fontFamily: "'Orbitron', sans-serif",
        color: s === 1 ? "#00ffcc" : "#446666",
      }).setOrigin(0.5);

      btn.on("pointerdown", () => {
        // game.loop.timeScale scales the entire game clock including delta,
        // which drives enemy movement, fire timers, tweens — everything.
        this.game.loop.timeScale = s;
        this._speedBtns.forEach(([b, t, sv]) => {
          b.setFillStyle(sv === s ? 0x002222 : 0x001111);
          t.setColor(sv === s ? "#00ffcc" : "#446666");
        });
      });
      this._speedBtns.push([btn, txt, s]);
    });
  }

  // ─── HTML TOOLTIP ───────────────────────────────────────────────
  _setupTooltip() {
    this._tooltip = document.getElementById('tooltip');
    this._tooltipCleanup = null;
  }

  _showTooltip(cfg) {
    this._tooltip.innerHTML = `
      <div class="tip-name">${cfg.name}</div>
      <div class="tip-cost">⬡ ${cfg.cost} gold</div>
      <div class="tip-stat">DMG   <span>${cfg.damage}</span></div>
      <div class="tip-stat">RANGE <span>${cfg.range}</span></div>
      <div class="tip-stat">RATE  <span>${(1000/cfg.fireRate).toFixed(1)}/s</span></div>
      <div style="color:#555;font-size:11px;margin-top:6px">${cfg.description}</div>`;
    this._tooltip.classList.add('visible');

    const onMove = (e) => {
      this._tooltip.style.left = (e.clientX + 18) + 'px';
      this._tooltip.style.top  = (e.clientY - 12) + 'px';
    };
    window.addEventListener('mousemove', onMove);
    this._tooltipCleanup = () => window.removeEventListener('mousemove', onMove);
  }

  _hideTooltip() {
    this._tooltip.classList.remove('visible');
    if (this._tooltipCleanup) { this._tooltipCleanup(); this._tooltipCleanup = null; }
  }
}