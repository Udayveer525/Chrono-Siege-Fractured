import { W, H, COLORS } from "./GameScene.js";
import { LEVELS } from "../data/levels.js"; // change per level

export default class LevelEditorScene extends Phaser.Scene {
  constructor() {
    super("LevelEditorScene");
    // Select level to edit (MANUALLY)
    this.i = 3; // change per level
  }

  create() {
    this.input.mouse.disableContextMenu();

    this.buildPads = [];

    this._buildBg();
    this._buildPath();

    // Load existing pads
    LEVELS[this.i - 1].buildPads.forEach((pos) => {
      this._createPad(pos.x, pos.y);
    });

    this._setupInput();
    this._setupExport();

    this._buildUI();
  }

  // ─── BACKGROUND ─────────────────────────────
  _buildBg() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x04040d);

    const g = this.add.graphics();
    g.lineStyle(1, 0x00ffcc, 0.09);

    for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);

    for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);
  }

  // ─── PATH (visual reference) ────────────────
  _buildPath() {
    const pts = LEVELS[this.i - 1].pathPoints;

    const path = this.add.path(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      path.lineTo(pts[i].x, pts[i].y);
    }

    const g = this.add.graphics();
    g.lineStyle(4, 0x00ffcc, 0.4);
    path.draw(g);
  }

  // ─── PAD CREATION ──────────────────────────
  _createPad(x, y) {
    const pad = this.add
      .circle(x, y, 20, COLORS.pad)
      .setStrokeStyle(2, COLORS.padStroke)
      .setInteractive({ draggable: true });

    this.input.setDraggable(pad);

    pad.on("pointerdown", (pointer) => {
      // Right click = delete
      if (pointer.rightButtonDown()) {
        pad.destroy();
        this.buildPads = this.buildPads.filter((p) => p !== pad);
      }
    });

    this.buildPads.push(pad);
  }

  // ─── INPUT ─────────────────────────────────
  _setupInput() {
    // Dragging
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      obj.x = Math.round(dragX / 10) * 10; // snap to 10px grid
      obj.y = Math.round(dragY / 10) * 10; // snap to 10px grid
    });

    // Left click = create pad
    this.input.on("pointerdown", (pointer) => {
      if (pointer.rightButtonDown()) return;

      // Check if we clicked on any existing object
      const hits = this.input.hitTestPointer(pointer);

      // If clicking on existing pad → do nothing (drag will handle it)
      if (hits.length > 0) return;

      // Otherwise → create new pad
      this._createPad(pointer.x, pointer.y);
    });
  }

  // ─── EXPORT ────────────────────────────────
  _setupExport() {
    this.input.keyboard.on("keydown-S", () => {
      const data = this.buildPads.map((p) => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
      }));

      console.log("=== COPY THIS ===");
      console.log(JSON.stringify(data, null, 1));
    });
  }

  // ─── UI ────────────────────────────────────
  _buildUI() {
    this.add.text(20, 20, "LEVEL EDITOR", {
      fontSize: "18px",
      color: "#00ffcc",
    });

    this.add.text(
      20,
      50,
      "Left click: Add pad\nRight click: Delete pad\nDrag: Move pad\nPress S: Export",
      {
        fontSize: "12px",
        color: "#aaaaaa",
      },
    );
  }
}
