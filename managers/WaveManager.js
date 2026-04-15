/**
 * WaveManager — reads wave data from the current level definition.
 * Wave format: [{ type, count, interval }]
 * Interval = ms between each enemy spawn within the group.
 * Groups within a wave are queued sequentially.
 */

export default class WaveManager {
  constructor(scene) {
    this.scene       = scene;
    this.waveNumber  = 1;
    this.spawning    = false;
    this.waitingForClear = false;
    this._betweenWaves   = false;
    this._elapsed        = 0;
    this._nextWaveDelay  = 5000; // ms between waves
  }

  get waves() { return this.scene.levelData.waves; }

  startWave() {
    if (this.scene.gameOver) return;
    const waveIndex = this.waveNumber - 1;
    if (waveIndex >= this.waves.length) { this.scene.levelComplete(); return; }

    this.spawning        = true;
    this.waitingForClear = false;
    this._betweenWaves   = false;

    this.scene.waveAnnounce(this.waveNumber);
    this.scene.setWaveStatus(`WAVE ${this.waveNumber} OF ${this.waves.length}  —  INCOMING`);

    const groups = this.waves[waveIndex];
    let delay = 0;

    groups.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        this.scene.time.delayedCall(delay, () => {
          if (!this.scene.gameOver) this.scene.spawnEnemy(group.type);
        });
        delay += group.interval || 700;
      }
      delay += 400; // small gap between groups within a wave
    });

    this.scene.time.delayedCall(delay + 300, () => {
      this.spawning        = false;
      this.waitingForClear = true;
      this.scene.setWaveStatus(`WAVE ${this.waveNumber}  —  CLEAR ALL ENEMIES`);
    });
  }

  update() {
    // Wave cleared — start between-wave timer
    if (this.waitingForClear && this.scene.enemies.length === 0) {
      this.waitingForClear = false;
      this._betweenWaves   = true;
      this._elapsed        = 0;
      this.scene.showMessage("WAVE CLEARED!", "#00ff44");
    }

    // Count down to next wave
    if (this._betweenWaves) {
      this._elapsed += 16;
      const remaining = Math.max(0, Math.ceil((this._nextWaveDelay - this._elapsed) / 1000));
      this.scene.setWaveStatus(`NEXT WAVE IN ${remaining}s  —  REINFORCE YOUR DEFENCES`);

      if (this._elapsed >= this._nextWaveDelay) {
        this._betweenWaves = false;
        this.waveNumber++;
        this.startWave();
      }
    }
  }
}