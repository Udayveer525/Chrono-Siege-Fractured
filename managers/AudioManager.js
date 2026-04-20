const AudioManager = {
  _sound:        null,
  _scene:        null,
  _currentMusic: null,
  _pendingMusic: null,
  _ready:        false,

  init(scene) {
    // Always update scene reference — don't bail on re-init
    this._sound = scene.sound;
    this._scene = scene;

    // Only register the unlock listeners once
    if (!this._unlockBound) {
      this._unlockBound = true;
      const unlock = () => {
        if (this._ready) return;
        this._ready = true;
        document.removeEventListener("pointerdown", unlock);
        document.removeEventListener("keydown",     unlock);
        if (this._pendingMusic) {
          const { key, volume } = this._pendingMusic;
          this._pendingMusic = null;
          this.playMusic(key, volume);
        }
      };
      document.addEventListener("pointerdown", unlock);
      document.addEventListener("keydown",     unlock);
    }
  },

  playMusic(key, volume = 0.45) {
    if (!this._sound) return;

    // Update scene reference in case we're called after a scene switch
    if (!this._ready) {
      this._pendingMusic = { key, volume };
      return;
    }

    // Don't restart the same track
    if (this._currentMusic?.isPlaying && this._currentMusic.key === key) return;

    // Stop current track
    if (this._currentMusic?.isPlaying) {
      try {
        const old = this._currentMusic;
        if (this._scene?.tweens) {
          this._scene.tweens.add({
            targets: old, volume: 0, duration: 800,
            onComplete: () => { try { old.stop(); } catch(e){} },
          });
        } else {
          old.stop();
        }
      } catch(e) {}
    }

    // Check the key is loaded before trying to play
    if (!this._scene?.cache?.audio?.has(key)) {
      console.warn(`AudioManager: "${key}" not loaded`);
      return;
    }

    try {
      const music = this._sound.add(key, { loop: true, volume: 0 });
      music.play();
      if (this._scene?.tweens) {
        this._scene.tweens.add({ targets: music, volume, duration: 1200 });
      } else {
        music.setVolume(volume);
      }
      this._currentMusic = music;
    } catch(e) {
      console.warn("AudioManager.playMusic failed:", e);
    }
  },

  stopMusic(fadeDuration = 800) {
    if (!this._currentMusic) return;
    const old = this._currentMusic;
    this._currentMusic = null;
    try {
      if (this._scene?.tweens) {
        this._scene.tweens.add({
          targets: old, volume: 0, duration: fadeDuration,
          onComplete: () => { try { old.stop(); } catch(e){} },
        });
      } else {
        old.stop();
      }
    } catch(e) {}
  },

  playSFX(key, volume = 0.7) {
    if (!this._sound || !this._ready) return;
    // Guard: only play if the asset is actually loaded
    if (!this._scene?.cache?.audio?.has(key)) return;
    try {
      this._sound.play(key, { volume });
    } catch(e) {}
  },

  updateScene(scene) {
    this._scene = scene;
    // Re-point the sound manager too in case it changed
    if (scene?.sound) this._sound = scene.sound;
  },
};

export default AudioManager;