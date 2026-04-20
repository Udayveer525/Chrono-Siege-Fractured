import Projectile   from "./Projectile.js";
import AudioManager from "../managers/AudioManager.js";

export default class Tower {
  constructor(scene, x, y, config, type) {
    this.scene          = scene;
    this.type           = type;
    this.level          = 1;
    this.maxLevel       = 3;
    this.range          = config.range;
    this.fireRate       = config.fireRate;
    this.damage         = config.damage;
    this.color          = config.color;
    this.projectileSpeed = config.projectileSpeed;
    this.projectileColor = config.projectileColor;
    this.projectileSize  = config.projectileSize;

    // ── Sprite or fallback shape ───────────────────────────────
    const spriteKey = config.spriteKey;  // e.g. "tower_pulse"
    const idleAnim  = `${spriteKey}_idle`;
    const hasSprite = spriteKey && scene.textures.exists(spriteKey);

    if (hasSprite) {
      this.sprite = scene.add.sprite(x, y, spriteKey);
      // Scale to fit a ~40px footprint
      const scale = 40 / this.sprite.height;
      this.sprite.setScale(scale);
      this.sprite.setDepth(5);
      if (scene.anims.exists(idleAnim)) this.sprite.play(idleAnim);
      this._usingSprite = true;
      this.innerSprite  = null;  // no inner shape needed
    } else {
      // Fallback shapes
      this.sprite = scene.add.rectangle(x, y, 34, 34, this.color);
      this.sprite.setStrokeStyle(2, config.strokeColor || 0xffffff).setDepth(5);
      this.innerSprite = scene.add.rectangle(x, y, 18, 18, 0x000000, 0.6);
      this.innerSprite.setStrokeStyle(1, this.color, 0.8).setDepth(6);
      this._usingSprite = false;
    }

    // Level indicator dots (shown below the sprite either way)
    this._levelDots = [];
    for (let i = 0; i < this.maxLevel; i++) {
      const dot = scene.add.circle(x - 10 + i * 10, y + 24, 3,
        i < this.level ? this.color : 0x333333);
      dot.setDepth(7);
      this._levelDots.push(dot);
    }

    // Range circle
    this.rangeCircle = scene.add.circle(x, y, this.range, 0x00ffcc, 0.04);
    this.rangeCircle.setStrokeStyle(1, this.color, 0.3).setVisible(false).setDepth(1);

    // Fire timer
    this.fireEvent = scene.time.addEvent({
      delay: this.fireRate, loop: true, callback: () => this.fire(),
    });

    // Input
    this.sprite.setInteractive();
    this.sprite.on("pointerover", () => {
      this.rangeCircle.setVisible(true);
      if (!this._usingSprite) this.sprite.setStrokeStyle(3, 0xffffff);
      else this.sprite.setTint(0xddffdd);
    });
    this.sprite.on("pointerout", () => {
      this.rangeCircle.setVisible(false);
      if (!this._usingSprite) this.sprite.setStrokeStyle(2, config.strokeColor || 0xffffff);
      else this.sprite.clearTint();
    });
    this.sprite.on("pointerdown", () => scene.openTowerMenu(this));
  }

  fire() {
    if (this.scene.gameOver) return;
    const target = this._pickTarget();
    if (!target) return;

    // Rotate sprite to face target
    if (this._usingSprite) {
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x, this.sprite.y,
        target.sprite.x, target.sprite.y
      );
      this.sprite.setRotation(angle);

      // Play fire animation then return to idle
      const fireAnim = `${this._spriteKey()}_fire`;
      const idleAnim = `${this._spriteKey()}_idle`;
      if (this.scene.anims.exists(fireAnim)) {
        this.sprite.play(fireAnim);
        this.sprite.once("animationcomplete", () => {
          if (this.sprite?.active && this.scene.anims.exists(idleAnim)) {
            this.sprite.play(idleAnim);
          }
        });
      }
    } else {
      // Shape fallback — muzzle flash
      const flash = this.scene.add.circle(
        this.sprite.x, this.sprite.y,
        this.projectileSize + 4, this.projectileColor, 0.7).setDepth(8);
      this.scene.tweens.add({
        targets: flash, radius: 2, alpha: 0, duration: 90,
        onComplete: () => flash.destroy(),
      });
    }

    this.scene.projectiles.push(new Projectile(
      this.scene, this.sprite.x, this.sprite.y, target, this.damage,
      { speed: this.projectileSpeed, color: this.projectileColor, size: this.projectileSize }
    ));

    AudioManager.playSFX("sfx_shoot", 0.2);
  }

  _spriteKey() {
    // Map tower type to sprite key
    const map = { basic: "tower_pulse", rapid: "tower_storm", heavy: "tower_titan", sniper: "tower_apex" };
    return map[this.type] || "tower_pulse";
  }

  _pickTarget() {
    let best = null, bestVal = -Infinity;
    for (const e of this.scene.enemies) {
      const dist = Phaser.Math.Distance.Between(
        this.sprite.x, this.sprite.y, e.sprite.x, e.sprite.y);
      if (dist > this.range) continue;
      const val = this.type === "sniper" ? e.hp : e.follower.t;
      if (val > bestVal) { bestVal = val; best = e; }
    }
    return best;
  }

  upgrade(cost) {
    if (this.level >= this.maxLevel) return;

    this.scene.gold -= cost;
    this.scene.events.emit("goldUpdate", this.scene.gold);

    this.damage   = Math.floor(this.damage * 1.55);
    this.range   += 25;
    this.fireRate = Math.max(150, Math.floor(this.fireRate * 0.85));
    this.fireEvent.delay = this.fireRate;
    this.rangeCircle.setRadius(this.range);

    this.level++;
    this._levelDots.forEach((dot, i) =>
      dot.setFillStyle(i < this.level ? this.color : 0x333333));

    if (!this._usingSprite) {
      this.sprite.setStrokeStyle(2 + this.level, 0xffffff);
    } else {
      // Pulse scale on upgrade
      this.scene.tweens.add({
        targets: this.sprite, scaleX: this.sprite.scaleX * 1.3, scaleY: this.sprite.scaleY * 1.3,
        duration: 120, yoyo: true,
      });
    }

    if (this.innerSprite) {
      this.scene.tweens.add({
        targets: this.innerSprite, scaleX: 1.25, scaleY: 1.25, duration: 120, yoyo: true,
      });
    }

    const flash = this.scene.add.text(this.sprite.x, this.sprite.y - 28, "▲ UPGRADED", {
      fontSize: "10px", fontFamily: "'Orbitron', sans-serif", color: "#00ff44",
    }).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({
      targets: flash, y: flash.y - 20, alpha: 0, duration: 700,
      onComplete: () => flash.destroy(),
    });
  }

  destroy() {
    this.fireEvent.remove();
    this.rangeCircle.destroy();
    if (this.innerSprite) this.innerSprite.destroy();
    this._levelDots.forEach(d => d.destroy());
    this.sprite.destroy();
  }
}