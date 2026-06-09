/**
 * UIScene — runs in parallel over GameScene.
 * Owns all HUD elements: stats panel, wave status, orbital button,
 * speed controls, and the HTML tooltip.
 * Communicates via GameScene's event emitter.
 */

import { W, H } from "./GameScene.js";
import SaveManager from "../managers/SaveManager.js";
import AudioManager from "../managers/AudioManager.js";

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
    this._buildPauseSystem();

    // Listen to GameScene events
    const gs = this.gameScene;
    gs.events.on("goldUpdate", (v) => this.goldText.setText(`${v}`));
    gs.events.on("scoreUpdate", (v) => this.scoreText.setText(`${v}`));
    gs.events.on("hpUpdate", (hp, max) => this.hpText.setText(`${hp}/${max}`));
    gs.events.on("waveUpdate", (n) => this.waveText.setText(`WAVE  ${n}`));
    gs.events.on("waveStatus", (t) => this.waveStatusText.setText(t));
    gs.events.on("orbitalCooldownStart", () => this._onOrbitalCooldownStart());
    gs.events.on("orbitalReady", () => this._onOrbitalReady());
    gs.events.on("showTooltip", (cfg) => this._showTooltip(cfg));
    gs.events.on("hideTooltip", () => this._hideTooltip());
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

    this.add.rectangle(px + pw / 2, py + ph / 2, pw, ph, 0x000000, 0.7)
      .setStrokeStyle(1, 0x00ffcc, 0.35);

    // Wave
    this.waveText = this.add.text(px + 14, py + 10, "WAVE  1", {
      fontSize: "16px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
    });

    // HP
    this.add.text(px + 14, py + 38, "HP", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#ff8888",
    });
    this.hpText = this.add.text(px + 48, py + 36, `${this.gameScene.baseHP}/${this.gameScene.maxBaseHP}`, {
      fontSize: "15px", fontFamily: "'Orbitron', sans-serif", color: "#ff4444", fontStyle: "bold",
    });

    // Gold
    this.add.text(px + 14, py + 63, "⬡", { fontSize: "15px", color: "#ffd700" });
    this.goldText = this.add.text(px + 36, py + 62, `${this.gameScene.gold}`, {
      fontSize: "16px", fontFamily: "'Orbitron', sans-serif", color: "#ffd700", fontStyle: "bold",
    });

    // Score
    this.add.text(px + 14, py + 91, "SCORE", {
      fontSize: "10px", fontFamily: "'Share Tech Mono', monospace", color: "#555",
    });
    this.scoreText = this.add.text(px + 72, py + 89, "0", {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#9999ff",
    });
  }

  // ─── WAVE STATUS BAR (bottom-center) ────────────────────────────
  _buildWaveStatusBar() {
    this.add.rectangle(W / 2, H - 14, 620, 24, 0x000000, 0.6)
      .setStrokeStyle(1, 0x00ffcc, 0.2);
    this.waveStatusText = this.add.text(W / 2, H - 14, "", {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#00ffcc",
    }).setOrigin(0.5);
  }

  // ─── ORBITAL BUTTON (bottom-right) ──────────────────────────────
  _buildOrbitalButton() {
    const bx = W - 96, by = H - 62;
    const hasIcon = this.textures.exists("icon_orbital");

    if (hasIcon) {
      this.orbitalBtn = this.add.sprite(bx, by - 4, "icon_orbital").setInteractive();
      const scale = 64 / this.orbitalBtn.height;
      this.orbitalBtn.setScale(scale);

      this.orbitalGlow = this.add.circle(bx, by - 4, 30, 0x000000, 0)
        .setStrokeStyle(2, 0x8888ff, 0.5);
    } else {
      this.add.rectangle(bx, by, 152, 66, 0x000000, 0.75).setStrokeStyle(1, 0x4444aa, 0.6);
      this.orbitalBtn = this.add.rectangle(bx, by, 150, 64, 0x0d0d44).setInteractive();
      this.orbitalBtnLabel = this.add.text(bx, by - 14, "◎  ORBITAL STRIKE", {
        fontSize: "11px", fontFamily: "'Orbitron', sans-serif",
        color: "#8888ff", fontStyle: "bold",
      }).setOrigin(0.5);
    }

    this.orbitalCdText = this.add.text(bx, by + 28, "READY", {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#aaaaff",
    }).setOrigin(0.5);

    this.add.rectangle(bx, by + 38, 100, 5, 0x111133);
    this.orbitalCdBar = this.add.rectangle(bx - 50, by + 38, 0, 5, 0x4455ff);
    this.orbitalCdBar.setOrigin(0, 0.5);

    this.orbitalBtn.on("pointerover", () => {
      if (this.gameScene.orbitalReady) {
        if (hasIcon) {
          this.orbitalBtn.setScale(68 / this.orbitalBtn.height * 1.1);
          this.orbitalGlow.setStrokeStyle(2, 0xaaaaff, 1);
        } else {
          this.orbitalBtn.setFillStyle(0x1a1a66);
        }
      }
    });
    this.orbitalBtn.on("pointerout", () => {
      if (hasIcon) {
        this.orbitalBtn.setScale(64 / this.orbitalBtn.height);
        this.orbitalGlow.setStrokeStyle(2, 0x8888ff, this.gameScene.orbitalReady ? 0.5 : 0);
      } else {
        this.orbitalBtn.setFillStyle(this.gameScene.orbitalReady ? 0x0d0d44 : 0x060618);
      }
    });
    this.orbitalBtn.on("pointerdown", () => {
      if (!this.gameScene.orbitalReady || this.gameScene.gameOver) return;
      this.gameScene.activateOrbitalMode();
    });
  }

  _onOrbitalCooldownStart() {
    if (this.textures.exists("icon_orbital")) {
      this.orbitalBtn.setTint(0x444455);
      this.orbitalGlow.setStrokeStyle(2, 0x8888ff, 0);
    } else {
      this.orbitalBtn.setFillStyle(0x060618);
      if (this.orbitalBtnLabel) this.orbitalBtnLabel.setColor("#334466");
    }
    this.orbitalCdText.setText("CHARGING...");
  }

  _onOrbitalReady() {
    if (this.textures.exists("icon_orbital")) {
      this.orbitalBtn.clearTint();
      this.orbitalGlow.setStrokeStyle(2, 0x8888ff, 0.5);
    } else {
      this.orbitalBtn.setFillStyle(0x0d0d44);
      if (this.orbitalBtnLabel) this.orbitalBtnLabel.setColor("#8888ff");
    }
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
    [[1, "1x", bx + 4], [2, "2x", bx + 52]].forEach(([s, label, x]) => {
      const btn = this.add.rectangle(x, by, 40, 20, s === 1 ? 0x002222 : 0x001111)
        .setInteractive().setStrokeStyle(1, 0x00ffcc, 0.3);
      const txt = this.add.text(x, by, label, {
        fontSize: "11px", fontFamily: "'Orbitron', sans-serif",
        color: s === 1 ? "#00ffcc" : "#446666",
      }).setOrigin(0.5);

      btn.on("pointerdown", () => {
        this.gameScene.time.timeScale = s;
        // Optionally update animations time scale if any global ones
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
      <div class="tip-stat">RATE  <span>${(1000 / cfg.fireRate).toFixed(1)}/s</span></div>
      <div style="color:#555;font-size:11px;margin-top:6px">${cfg.description}</div>`;
    this._tooltip.classList.add('visible');

    const onMove = (e) => {
      this._tooltip.style.left = (e.clientX + 18) + 'px';
      this._tooltip.style.top = (e.clientY - 12) + 'px';
    };
    window.addEventListener('mousemove', onMove);
    this._tooltipCleanup = () => window.removeEventListener('mousemove', onMove);
  }

  _hideTooltip() {
    this._tooltip.classList.remove('visible');
    if (this._tooltipCleanup) { this._tooltipCleanup(); this._tooltipCleanup = null; }
  }

  // ─── PAUSE SYSTEM ────────────────────────────────────────────────
  _buildPauseSystem() {
    // Pause button top right
    const px = W - 30, py = 30;
    const pauseBtn = this.add.circle(px, py, 20, 0x000000, 0.6).setStrokeStyle(1, 0x00ffcc, 0.5).setInteractive();
    this.add.text(px, py, "⏸", { fontSize: "18px", color: "#00ffcc" }).setOrigin(0.5);

    // Overlay
    this.pauseOverlay = this.add.container(0, 0).setDepth(100).setVisible(false);
    this.pauseOverlay.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setInteractive()); // block inputs

    // Panel
    const panel = this.add.rectangle(W / 2, H / 2, 400, 360, 0x050510).setStrokeStyle(2, 0x00ffcc, 0.6);
    this.pauseOverlay.add(panel);

    this.pauseOverlay.add(this.add.text(W / 2, H / 2 - 140, "PAUSED", {
      fontSize: "32px", fontFamily: "'Orbitron', sans-serif", color: "#00ffcc", fontStyle: "bold"
    }).setOrigin(0.5));

    // Volume Controls
    const save = SaveManager.load();
    let { sfxVolume, musicVolume } = save;

    const createVolumeControl = (y, label, initialValue, onUpdate) => {
      this.pauseOverlay.add(this.add.text(W / 2, y - 20, label, { fontSize: "14px", fontFamily: "'Share Tech Mono', monospace", color: "#888" }).setOrigin(0.5));

      const valTxt = this.add.text(W / 2, y, `${Math.round(initialValue * 100)}%`, { fontSize: "20px", fontFamily: "'Orbitron', sans-serif", color: "#fff" }).setOrigin(0.5);
      this.pauseOverlay.add(valTxt);

      const minus = this.add.text(W / 2 - 60, y, "-", { fontSize: "24px", color: "#ff4444" }).setOrigin(0.5).setInteractive();
      const plus = this.add.text(W / 2 + 60, y, "+", { fontSize: "24px", color: "#44ff44" }).setOrigin(0.5).setInteractive();

      let val = initialValue;
      minus.on("pointerdown", () => {
        val = Math.max(0, val - 0.1);
        valTxt.setText(`${Math.round(val * 100)}%`);
        onUpdate(val);
      });
      plus.on("pointerdown", () => {
        val = Math.min(1, val + 0.1);
        valTxt.setText(`${Math.round(val * 100)}%`);
        onUpdate(val);
      });
      this.pauseOverlay.add([minus, plus]);
    };

    createVolumeControl(H / 2 - 60, "SFX VOLUME", sfxVolume, (v) => { SaveManager.updateSettings({ sfxVolume: v }); AudioManager.playSFX("sfx_shoot", 0.3); });
    createVolumeControl(H / 2 + 10, "MUSIC VOLUME", musicVolume, (v) => { SaveManager.updateSettings({ musicVolume: v }); AudioManager.setMusicVolume(v); });

    // Resume button
    const resumeBtn = this.add.rectangle(W / 2, H / 2 + 90, 200, 40, 0x002211).setStrokeStyle(1, 0x00ff44).setInteractive();
    this.pauseOverlay.add(resumeBtn);
    this.pauseOverlay.add(this.add.text(W / 2, H / 2 + 90, "RESUME", { fontSize: "14px", fontFamily: "'Orbitron', sans-serif", color: "#00ff44" }).setOrigin(0.5));

    // Quit button
    const quitBtn = this.add.rectangle(W / 2, H / 2 + 140, 200, 40, 0x220000).setStrokeStyle(1, 0xff4444).setInteractive();
    this.pauseOverlay.add(quitBtn);
    this.pauseOverlay.add(this.add.text(W / 2, H / 2 + 140, "QUIT TO MENU", { fontSize: "14px", fontFamily: "'Orbitron', sans-serif", color: "#ff4444" }).setOrigin(0.5));

    pauseBtn.on("pointerdown", () => {
      this.gameScene.scene.pause();
      this.pauseOverlay.setVisible(true);
    });

    resumeBtn.on("pointerdown", () => {
      this.pauseOverlay.setVisible(false);
      this.gameScene.scene.resume();
    });

    quitBtn.on("pointerdown", () => {
      this.gameScene.scene.resume(); // resume before stopping to prevent state bugs
      this.gameScene.scene.stop();
      this.scene.start("BootScene");
    });
  }
}