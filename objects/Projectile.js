export default class Projectile {
  constructor(scene, x, y, target, damage, config) {
    this.scene = scene;
    this.target = target;
    this.damage = damage;
    this.speed = config.speed;
    this._destroyed = false;

    this.sprite = scene.add.circle(x, y, config.size, config.color);
    this.sprite.setDepth(9);

    this._trailTimer = 0;
    this._trailTweens = [];
  }

  update(delta) {
    if (this._destroyed) return true;
    if (!this.target || !this.target.sprite || !this.target.sprite.active) return true;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      this.target.sprite.x, this.target.sprite.y
    );

    this.sprite.x += Math.cos(angle) * this.speed * (delta / 1000);
    this.sprite.y += Math.sin(angle) * this.speed * (delta / 1000);

    // Trail dots — simple alpha fade, no radius tween (avoids null-set crash)
    this._trailTimer += delta;
    if (this._trailTimer > 35) {
      this._trailTimer = 0;
      const r = Math.max(1, this.sprite.radius * 0.45);
      const trail = this.scene.add.circle(this.sprite.x, this.sprite.y, r, this.sprite.fillColor, 0.45).setDepth(8);
      const tw = this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 110,
        onComplete: () => { if (trail.active) trail.destroy(); }
      });
      this._trailTweens.push({ trail, tw });
    }

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      this.target.sprite.x, this.target.sprite.y
    );

    if (dist < 10) {
      this.target.takeDamage(this.damage);
      return true;
    }
    return false;
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    // Stop all pending trail tweens before their circles get GC'd
    this._trailTweens.forEach(({ trail, tw }) => {
      tw.stop();
      if (trail.active) trail.destroy();
    });
    this._trailTweens = [];
    if (this.sprite.active) this.sprite.destroy();
  }
}