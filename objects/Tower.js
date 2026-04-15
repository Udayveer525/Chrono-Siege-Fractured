import Projectile from "./Projectile.js";

export default class Tower {
  constructor(scene, x, y, config, type) {
    this.scene = scene;
    this.type  = type;
    this.level = 1;
    this.maxLevel = 3;
    this.range          = config.range;
    this.fireRate       = config.fireRate;
    this.damage         = config.damage;
    this.color          = config.color;
    this.projectileSpeed = config.projectileSpeed;
    this.projectileColor = config.projectileColor;
    this.projectileSize  = config.projectileSize;

    // Visuals
    this.sprite = scene.add.rectangle(x, y, 34, 34, this.color);
    this.sprite.setStrokeStyle(2, config.strokeColor || 0xffffff).setDepth(5);

    this.innerSprite = scene.add.rectangle(x, y, 18, 18, 0x000000, 0.6);
    this.innerSprite.setStrokeStyle(1, this.color, 0.8).setDepth(6);

    this._levelDots = [];
    for (let i = 0; i < this.maxLevel; i++) {
      const dot = scene.add.circle(x - 10 + i * 10, y + 22, 3, i < this.level ? this.color : 0x333333);
      dot.setDepth(7);
      this._levelDots.push(dot);
    }

    this.rangeCircle = scene.add.circle(x, y, this.range, 0x00ffcc, 0.04);
    this.rangeCircle.setStrokeStyle(1, this.color, 0.3).setVisible(false).setDepth(1);

    this.fireEvent = scene.time.addEvent({ delay: this.fireRate, loop: true, callback: () => this.fire() });

    this.sprite.setInteractive();
    this.sprite.on("pointerover", () => { this.rangeCircle.setVisible(true);  this.sprite.setStrokeStyle(3, 0xffffff); });
    this.sprite.on("pointerout",  () => { this.rangeCircle.setVisible(false); this.sprite.setStrokeStyle(2, config.strokeColor || 0xffffff); });
    this.sprite.on("pointerdown", () => scene.openTowerMenu(this));
  }

  fire() {
    if (this.scene.gameOver) return;
    const target = this._pickTarget();
    if (!target) return;

    const flash = this.scene.add.circle(this.sprite.x, this.sprite.y, this.projectileSize + 4, this.projectileColor, 0.7).setDepth(8);
    this.scene.tweens.add({ targets: flash, radius: 2, alpha: 0, duration: 90, onComplete: () => flash.destroy() });

    this.scene.projectiles.push(new Projectile(
      this.scene, this.sprite.x, this.sprite.y, target, this.damage,
      { speed: this.projectileSpeed, color: this.projectileColor, size: this.projectileSize }
    ));
  }

  _pickTarget() {
    let best = null, bestVal = -Infinity;
    for (const e of this.scene.enemies) {
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, e.sprite.x, e.sprite.y);
      if (dist > this.range) continue;
      const val = this.type === "sniper" ? e.hp : e.follower.t;
      if (val > bestVal) { bestVal = val; best = e; }
    }
    return best;
  }

  upgrade(cost) {
    if (this.level >= this.maxLevel) return;

    // Fix: use event emitter instead of direct goldText reference
    this.scene.gold -= cost;
    this.scene.events.emit("goldUpdate", this.scene.gold);

    this.damage    = Math.floor(this.damage * 1.55);
    this.range    += 25;
    this.fireRate  = Math.max(150, Math.floor(this.fireRate * 0.85));
    this.fireEvent.delay = this.fireRate;
    this.rangeCircle.setRadius(this.range);

    this.level++;
    this._levelDots.forEach((dot, i) => dot.setFillStyle(i < this.level ? this.color : 0x333333));
    this.sprite.setStrokeStyle(2 + this.level, 0xffffff);

    this.scene.tweens.add({ targets: [this.sprite, this.innerSprite], scaleX: 1.25, scaleY: 1.25, duration: 120, yoyo: true });

    const flash = this.scene.add.text(this.sprite.x, this.sprite.y - 28, "▲ UPGRADED", {
      fontSize: "10px", fontFamily: "'Orbitron', sans-serif", color: "#00ff44",
    }).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({ targets: flash, y: flash.y - 20, alpha: 0, duration: 700, onComplete: () => flash.destroy() });
  }

  destroy() {
    this.fireEvent.remove();
    this.rangeCircle.destroy();
    this.innerSprite.destroy();
    this._levelDots.forEach(d => d.destroy());
    this.sprite.destroy();
  }
}