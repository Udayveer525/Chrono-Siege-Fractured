export default class Enemy {
  constructor(scene, path, typeConfig, waveNumber) {
    this.scene = scene;
    this.path = path;
    this.typeConfig = typeConfig;
    this.follower = { t: 0, vec: new Phaser.Math.Vector2() };

    // HP scaling
    this.baseHP = typeConfig.hp;
    this.maxHP = this.baseHP * Math.pow(1.1, waveNumber - 1);
    this.hp = this.maxHP;

    this.speed = typeConfig.speed;
    this.reward = typeConfig.reward;
    this._hitFlash = false;

    // Body
    this.sprite = scene.add.circle(0, 0, typeConfig.radius, typeConfig.color);
    this.sprite.setDepth(4);
    this.sprite.setStrokeStyle(1.5, 0xffffff, 0.3);

    // Inner pupil detail
    this.innerDot = scene.add.circle(0, 0, Math.max(3, typeConfig.radius * 0.3), 0x000000, 0.6);
    this.innerDot.setDepth(5);

    // HP bar background
    const barW = typeConfig.radius * 2.5;
    this.hpBarBg = scene.add.rectangle(0, 0, barW, 4, 0x220000);
    this.hpBarBg.setStrokeStyle(0.5, 0x440000);
    this.hpBarBg.setDepth(6);

    // HP bar fill
    this.hpBar = scene.add.rectangle(0, 0, barW, 4, 0x00ff44);
    this.hpBar.setOrigin(0, 0.5);
    this.hpBar.setDepth(7);

    // Name tag for boss/tank
    if (typeConfig.radius >= 16) {
      this.nameTag = scene.add.text(0, 0, typeConfig.name || "", {
        fontSize: "7px",
        fontFamily: "'Share Tech Mono', monospace",
        color: "#ffffff",
        alpha: 0.7,
      }).setOrigin(0.5).setDepth(8);
    }
  }

  update(delta) {
    if (this.follower.t > 1) return false;

    this.path.getPoint(this.follower.t, this.follower.vec);
    const { x, y } = this.follower.vec;

    this.sprite.setPosition(x, y);
    this.innerDot.setPosition(x, y);

    const barW = this.typeConfig.radius * 2.5;
    const hpPct = Math.max(0, this.hp / this.maxHP);
    this.hpBarBg.setPosition(x, y - this.typeConfig.radius - 6);
    this.hpBar.setPosition(x - barW / 2, y - this.typeConfig.radius - 6);
    this.hpBar.width = barW * hpPct;

    // Color the HP bar: green > yellow > red
    const hpColor = hpPct > 0.5 ? 0x00ff44 : hpPct > 0.25 ? 0xffaa00 : 0xff2222;
    this.hpBar.setFillStyle(hpColor);

    if (this.nameTag) this.nameTag.setPosition(x, y + this.typeConfig.radius + 8);

    this.follower.t += this.speed * delta;
    return true;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this._hitFlash) return;
    this._hitFlash = true;
    this.sprite.setFillStyle(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.sprite.active) {
        this.sprite.setFillStyle(this.typeConfig.color);
        this._hitFlash = false;
      }
    });
  }

  isDead() { return this.hp <= 0; }

  destroy() {
    this.sprite.destroy();
    this.innerDot.destroy();
    this.hpBar.destroy();
    this.hpBarBg.destroy();
    if (this.nameTag) this.nameTag.destroy();
  }
}