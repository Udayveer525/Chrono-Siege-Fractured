export default class Enemy {
  constructor(scene, path, typeConfig, waveNumber) {
    this.scene      = scene;
    this.path       = path;
    this.typeConfig = typeConfig;
    this.follower   = { t: 0, vec: new Phaser.Math.Vector2() };

    // Stats
    this.baseHP     = typeConfig.hp;
    this.maxHP      = this.baseHP * Math.pow(1.1, waveNumber - 1);
    this.hp         = this.maxHP;
    this.speed      = typeConfig.speed;
    this.reward     = typeConfig.reward;
    this.baseDamage = typeConfig.baseDamage || 1;

    this._hitFlash  = false;
    this._dead      = false;

    // ── Sprite or fallback shape ───────────────────────────────
    const spriteKey = typeConfig.spriteKey; // e.g. "enemy_scout"
    const walkAnim  = `${spriteKey}_walk`;
    const hasSprite = spriteKey && scene.textures.exists(spriteKey);

    if (hasSprite) {
      this.sprite = scene.add.sprite(0, 0, spriteKey);
      // Scale so sprite visually matches the enemy's collision radius
      // Frame is 128x123px; we want display height ≈ radius * 4.5
      const targetSize = typeConfig.radius * 4.5;
      const scale = targetSize / this.sprite.height;
      this.sprite.setScale(scale);
      // Tower defense enemies face right by default; path goes left-to-right initially
      // We'll flip/rotate in update() based on movement direction
      this.sprite.setDepth(4);
      if (scene.anims.exists(walkAnim)) {
        this.sprite.play(walkAnim);
      }
      this._usingSprite = true;
    } else {
      // Fallback: coloured circle (same as before)
      this.sprite = scene.add.circle(0, 0, typeConfig.radius, typeConfig.color);
      this.sprite.setDepth(4).setStrokeStyle(1.5, 0xffffff, 0.3);
      this.innerDot = scene.add.circle(0, 0, Math.max(3, typeConfig.radius * 0.3), 0x000000, 0.6);
      this.innerDot.setDepth(5);
      this._usingSprite = false;
    }

    // ── HP bar (always shown) ──────────────────────────────────
    const barW = typeConfig.radius * 2.8;
    this.hpBarBg = scene.add.rectangle(0, 0, barW, 5, 0x220000)
      .setStrokeStyle(0.5, 0x440000).setDepth(6);
    this.hpBar = scene.add.rectangle(0, 0, barW, 5, 0x00ff44)
      .setOrigin(0, 0.5).setDepth(7);

    // Name tag for large enemies
    if (typeConfig.radius >= 16) {
      this.nameTag = scene.add.text(0, 0, typeConfig.name || "", {
        fontSize: "7px", fontFamily: "'Share Tech Mono', monospace",
        color: "#ffffff",
      }).setOrigin(0.5).setDepth(8).setAlpha(0.75);
    }

    // Track previous position for direction
    this._prevX = null;
    this._prevY = null;
    this._usesRotation = typeConfig.usesRotation || false;
  }

  update(delta) {
    if (this._dead || this.follower.t > 1) return false;

    this.path.getPoint(this.follower.t, this.follower.vec);
    const { x, y } = this.follower.vec;

    // Direction — rotate for ships with boosters, flip for symmetric enemies
    if (this._usingSprite && this._prevX !== null) {
      if (this._usesRotation) {
        // Full rotation toward movement direction (runner has directional boosters)
        const angle = Phaser.Math.Angle.Between(this._prevX, this._prevY, x, y);
        this.sprite.setRotation(angle); // sprite faces RIGHT by default
      } else {
        // Horizontal flip only for symmetric enemies
        if (Math.abs(x - this._prevX) > 0.5) {
          this.sprite.setFlipX(x < this._prevX);
        }
      }
    }
    this._prevX = x;
    this._prevY = y;

    this.sprite.setPosition(x, y);
    if (this.innerDot) this.innerDot.setPosition(x, y);

    // HP bar
    const barW  = this.typeConfig.radius * 2.8;
    const hpPct = Math.max(0, this.hp / this.maxHP);
    const barY  = y - this.typeConfig.radius - 8;
    this.hpBarBg.setPosition(x, barY);
    this.hpBar.setPosition(x - barW / 2, barY);
    this.hpBar.width = barW * hpPct;
    this.hpBar.setFillStyle(hpPct > 0.5 ? 0x00ff44 : hpPct > 0.25 ? 0xffaa00 : 0xff2222);

    if (this.nameTag) this.nameTag.setPosition(x, y + this.typeConfig.radius + 9);

    this.follower.t += this.speed * delta;
    return true;
  }

  takeDamage(amount) {
    if (this._dead) return;
    this.hp -= amount;

    if (this._hitFlash) return;
    this._hitFlash = true;

    if (this._usingSprite) {
      this.sprite.setTint(0xffffff);
      this.scene.time.delayedCall(60, () => {
        if (this.sprite?.active) {
          this.sprite.clearTint();
          this._hitFlash = false;
        }
      });
    } else {
      this.sprite.setFillStyle(0xffffff);
      this.scene.time.delayedCall(60, () => {
        if (this.sprite?.active) {
          this.sprite.setFillStyle(this.typeConfig.color);
          this._hitFlash = false;
        }
      });
    }
  }

  isDead() { return this.hp <= 0; }

  // Play death animation then call onComplete — used by GameScene.killEnemy
  playDeath(onComplete) {
    this._dead = true;
    const deathAnim = `${this.typeConfig.spriteKey}_death`;

    // Hide HP bar immediately
    this.hpBarBg.setVisible(false);
    this.hpBar.setVisible(false);
    if (this.nameTag) this.nameTag.setVisible(false);

    if (this._usingSprite && this.scene.anims.exists(deathAnim)) {
      this.sprite.clearTint();
      this.sprite.play(deathAnim);
      this.sprite.once("animationcomplete", () => {
        onComplete?.();
        this.destroy();
      });
    } else {
      // No death animation — just explode and destroy
      onComplete?.();
      this.destroy();
    }
  }

  destroy() {
    this._dead = true;
    if (this.sprite?.active)    this.sprite.destroy();
    if (this.innerDot?.active)  this.innerDot.destroy();
    if (this.hpBarBg?.active)   this.hpBarBg.destroy();
    if (this.hpBar?.active)     this.hpBar.destroy();
    if (this.nameTag?.active)   this.nameTag.destroy();
  }
}