import SaveManager from "../managers/SaveManager.js";
import Enemy         from "../objects/Enemy.js";
import Tower         from "../objects/Tower.js";
import WaveManager   from "../managers/WaveManager.js";
import AudioManager from "../managers/AudioManager.js";
import towersData    from "../data/towers.js";
import { LEVELS, ENEMIES } from "../data/levels.js";
import { ACTS, LEVEL_LORE } from "../data/story.js";

export const W = 1200, H = 720;

export const COLORS = {
  pad: 0x001a1a, padStroke: 0x00ffcc,
  base: 0x1a1aff, baseStroke: 0x4444ff,
};

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  init(data) {
    this.levelId   = data?.levelId || 1;
    this.levelData = LEVELS.find(l => l.id === this.levelId) || LEVELS[0];

    this.enemies     = [];
    this.towers      = [];
    this.projectiles = [];
    this.baseHP      = this.levelData.baseHP;
    this.maxBaseHP   = this.levelData.baseHP;
    this.gold        = this.levelData.startGold;
    this.score       = 0;
    this.gameOver    = false;
    this.buildMenu   = null;
    this.towerMenu   = null;
    this.orbitalReady          = true;
    this.orbitalCooldown       = 25000;
    this._orbitalCooldownStart = 0;
    this._orbitalTargeting     = false;
  }

  create() {
    this._buildBackground();
    this._buildPath();
    this._buildPads();
    this._buildBase();

    this.scene.launch("UIScene", { gameScene: this });

    this.input.on("pointerdown", (pointer) => {
      if (this._orbitalTargeting) return;
      if (!this.buildMenu && !this.towerMenu) return;
      if (this.input.hitTestPointer(pointer).length === 0) {
        this.closeBuildMenu(); this.closeTowerMenu();
      }
    });

    this.waveManager = new WaveManager(this);

    // Narrative intro → countdown → wave 1
    this._showLevelIntro(() => {
      this._showCountdown(3, () => this.waveManager.startWave());
    });
  }

  // ─── BACKGROUND ─────────────────────────────────────────────────
  _buildBackground() {
    const g = this.add.graphics();
    g.lineStyle(1, this.levelData.pathColor, 0.04);
    for (let x=0;x<=W;x+=50) g.lineBetween(x,0,x,H);
    for (let y=0;y<=H;y+=50) g.lineBetween(0,y,W,y);
    g.lineStyle(2, this.levelData.pathColor, 0.28);
    const cs = 28;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx,cy]) => {
      const dx=cx===0?1:-1, dy=cy===0?1:-1;
      g.lineBetween(cx,cy,cx+dx*cs,cy); g.lineBetween(cx,cy,cx,cy+dy*cs);
    });
  }

  // ─── PATH ───────────────────────────────────────────────────────
  _buildPath() {
    const pts = this.levelData.pathPoints;
    this.path = this.add.path(pts[0].x, pts[0].y);
    for (let i=1;i<pts.length;i++) this.path.lineTo(pts[i].x, pts[i].y);

    const glow = this.add.graphics();
    glow.lineStyle(16, this.levelData.pathColor, 0.06);
    this.path.draw(glow);

    const line = this.add.graphics();
    line.lineStyle(3, this.levelData.pathColor, 0.65);
    this.path.draw(line);

    // Direction arrows
    const ag = this.add.graphics();
    ag.fillStyle(this.levelData.pathColor, 0.2);
    for (let i=2;i<32;i++) {
      const t=i/32, pt=this.path.getPoint(t), p2=this.path.getPoint(Math.min(t+0.01,1));
      if (!pt||!p2) continue;
      const a=Math.atan2(p2.y-pt.y,p2.x-pt.x),s=5;
      ag.fillTriangle(
        pt.x+Math.cos(a)*s,         pt.y+Math.sin(a)*s,
        pt.x+Math.cos(a+2.4)*s*0.6, pt.y+Math.sin(a+2.4)*s*0.6,
        pt.x+Math.cos(a-2.4)*s*0.6, pt.y+Math.sin(a-2.4)*s*0.6
      );
    }
  }

  // ─── BUILD PADS ─────────────────────────────────────────────────
  _buildPads() {
    this.buildPads = [];
    this.levelData.buildPads.forEach((pos) => {
      const pad = this.add.circle(pos.x, pos.y, 20, COLORS.pad);
      pad.setStrokeStyle(1.5, COLORS.padStroke).setAlpha(0.65).setInteractive();
      pad.hasTower = false;

      const mark = this.add.graphics();
      mark.lineStyle(1, this.levelData.pathColor, 0.22);
      mark.lineBetween(pos.x-7,pos.y,pos.x+7,pos.y);
      mark.lineBetween(pos.x,pos.y-7,pos.x,pos.y+7);

      pad.on("pointerover", () => { if (!pad.hasTower) { pad.setAlpha(1); pad.setStrokeStyle(2,COLORS.padStroke); } });
      pad.on("pointerout",  () => { if (!pad.hasTower) { pad.setAlpha(0.65); pad.setStrokeStyle(1.5,COLORS.padStroke); } });
      pad.on("pointerdown", () => {
        if (this.gameOver || this._orbitalTargeting) return;
        if (pad.hasTower) { this.showMessage("Pad occupied!"); return; }
        this.closeTowerMenu(); this.openBuildMenu(pad);
      });
      this.buildPads.push(pad);
    });
  }

  // ─── BASE ────────────────────────────────────────────────────────
  _buildBase() {
    const last = this.levelData.pathPoints[this.levelData.pathPoints.length-1];
    this.baseX = last.x; this.baseY = last.y;

    // Glow ring underneath
    this.baseGlow = this.add.circle(this.baseX, this.baseY, 52, COLORS.base, 0.12).setDepth(1);

    // Core sprite or fallback rectangle
    const hasCoreSprite = this.textures.exists("base_core");
    if (hasCoreSprite) {
      this.base = this.add.sprite(this.baseX, this.baseY, "base_core");
      // Scale to roughly 80px display size
      const scale = 80 / this.base.height;
      this.base.setScale(scale).setDepth(2);
      if (this.anims.exists("core_idle")) this.base.play("core_idle");
      this._usingCoreSprite = true;
    } else {
      this.base = this.add.rectangle(this.baseX, this.baseY, 54, 54, COLORS.base);
      this.base.setStrokeStyle(2, COLORS.baseStroke).setDepth(2);
      this.add.text(this.baseX, this.baseY, "BASE", {
        fontSize: "10px", fontFamily: "'Orbitron', sans-serif", color: "#4488ff",
      }).setOrigin(0.5).setDepth(3);
      this._usingCoreSprite = false;
    }

    // HP bar — sits below the base
    const barOffsetY = hasCoreSprite ? 52 : 38;
    this.baseHPBarBg = this.add.rectangle(this.baseX, this.baseY + barOffsetY, 70, 5, 0x111111);
    this.baseHPBarBg.setStrokeStyle(1, 0x333333).setDepth(3);
    this.baseHPBar = this.add.rectangle(this.baseX - 35, this.baseY + barOffsetY, 70, 5, 0x00ff44);
    this.baseHPBar.setOrigin(0, 0.5).setDepth(4);
  }

  // ─── LEVEL INTRO ────────────────────────────────────────────────
  _showLevelIntro(onDone) {
    const ld   = this.levelData;
    const lore = LEVEL_LORE[ld.id] || {};
    const name     = lore.name     || `LEVEL ${ld.id}`;
    const subtitle = lore.subtitle || "";
    const loreText = lore.lore     || "";

    const panel = this.add.container(W/2, H/2).setDepth(200);

    const bg = this.add.rectangle(0, 0, 580, 320, 0x04040d, 0.97);
    bg.setStrokeStyle(1.5, ld.pathColor, 0.7);
    panel.add(bg);

    // Mission tag
    panel.add(this.add.text(-260, -130, `MISSION ${ld.id}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#445566",
    }).setOrigin(0, 0.5));

    // Level name
    panel.add(this.add.text(0, -90, name, {
      fontSize: "28px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5));

    // Subtitle
    if (subtitle) {
      panel.add(this.add.text(0, -54, subtitle.toUpperCase(), {
        fontSize: "11px", fontFamily: "'Share Tech Mono', monospace",
        color: "#00ffcc", letterSpacing: 3,
      }).setOrigin(0.5));
    }

    // Divider
    panel.add(this.add.rectangle(0, -34, 480, 1, 0x00ffcc, 0.18));

    // Lore text — properly coloured now
    panel.add(this.add.text(0, 10, loreText, {
      fontSize: "13px", fontFamily: "'Share Tech Mono', monospace",
      color: "#aabbcc", align: "center",
      lineSpacing: 5, wordWrap: { width: 510 },
    }).setOrigin(0.5));

    // Deploy button
    const deployBtn = this.add.rectangle(0, 128, 200, 42, 0x001a11)
      .setStrokeStyle(1.5, 0x00ff66, 0.7).setInteractive();
    const deployTxt = this.add.text(0, 128, "▶  DEPLOY", {
      fontSize: "13px", fontFamily: "'Orbitron', sans-serif", color: "#00ff66", fontStyle: "bold",
    }).setOrigin(0.5);
    panel.add(deployBtn); panel.add(deployTxt);

    panel.setScale(0.85).setAlpha(0);
    this.tweens.add({ targets: panel, scaleX: 1, scaleY: 1, alpha: 1, duration: 350, ease: "Back.Out" });

    deployBtn.on("pointerover",  () => deployBtn.setFillStyle(0x003322));
    deployBtn.on("pointerout",   () => deployBtn.setFillStyle(0x001a11));
    deployBtn.on("pointerdown",  () => {
      this.tweens.add({
        targets: panel, alpha: 0, scaleX: 0.9, scaleY: 0.9, duration: 250,
        onComplete: () => { panel.destroy(); onDone(); }
      });
    });
  }

  // ─── BUILD MENU ─────────────────────────────────────────────────
  openBuildMenu(pad) {
    this.closeBuildMenu();
    this.buildMenu = this.add.container(pad.x, pad.y).setDepth(50);

    const types  = Object.keys(towersData);
    const radius = 95;
    const angles = types.map((_,i) => Phaser.Math.DegToRad(-150 + i*(300/(types.length-1))));

    const bg = this.add.circle(0,0,118,0x000000,0.82).setStrokeStyle(1,0x00ffcc,0.3);
    this.buildMenu.add(bg);

    // Keep references to each button set so we can refresh them
    const buttonSets = [];

    types.forEach((type, i) => {
      const angle=angles[i], bx=Math.cos(angle)*radius, by=Math.sin(angle)*radius;
      const cfg=towersData[type];

      const btn = this.add.circle(bx,by,28,cfg.color,0.2)
        .setStrokeStyle(2,0x333333).setInteractive();

      const nameTxt = this.add.text(bx,by,cfg.name,{
        fontSize:"7px",fontFamily:"'Orbitron',sans-serif",
        color:"#444",fontStyle:"bold",
      }).setOrigin(0.5);

      const costTxt = this.add.text(bx,by+40,`⬡ ${cfg.cost}`,{
        fontSize:"13px",fontFamily:"'Orbitron',sans-serif",
        color:"#665500",fontStyle:"bold",
      }).setOrigin(0.5);

      // Refresh visuals based on current gold
      const refresh = () => {
        const can = this.gold >= cfg.cost;
        btn.setAlpha(can ? 1 : 0.25).setStrokeStyle(2, can ? 0xffffff : 0x333333);
        nameTxt.setColor(can ? "#fff" : "#444");
        costTxt.setColor(can ? "#ffd700" : "#665500");
      };
      refresh(); // set initial state

      btn.on("pointerover", () => {
        if(this.gold < cfg.cost) return;
        btn.setScale(1.15);
        this.events.emit("showTooltip", cfg);
      });
      btn.on("pointerout",  () => { btn.setScale(1); this.events.emit("hideTooltip"); });
      btn.on("pointerdown", () => {
        if(this.gold < cfg.cost){ this.showMessage("Not enough gold!"); return; }
        const tower=this.placeTower(pad.x,pad.y,type);
        pad.tower=tower; pad.hasTower=true; pad.setAlpha(1);
        this.closeBuildMenu(); this.events.emit("hideTooltip");
      });

      this.buildMenu.add(btn); this.buildMenu.add(nameTxt); this.buildMenu.add(costTxt);
      buttonSets.push(refresh);
    });

    // Listen to gold changes and refresh all buttons
    const onGoldUpdate = () => buttonSets.forEach(r => r());
    this.events.on("goldUpdate", onGoldUpdate);
    this.buildMenu._goldListener = onGoldUpdate; // store so closeBuildMenu can remove it

    const cancelBtn=this.add.circle(0,0,16,0x330000).setStrokeStyle(1.5,0xff4444).setInteractive();
    const cancelTxt=this.add.text(0,0,"✕",{fontSize:"12px",color:"#ff4444"}).setOrigin(0.5);
    cancelBtn.on("pointerdown",()=>this.closeBuildMenu());
    this.buildMenu.add(cancelBtn); this.buildMenu.add(cancelTxt);

    this.buildMenu.setScale(0);
    this.tweens.add({targets:this.buildMenu,scale:1,duration:200,ease:"Back.Out"});
  }

  closeBuildMenu() {
    if(this.buildMenu){
      if(this.buildMenu._goldListener) this.events.off("goldUpdate", this.buildMenu._goldListener);
      this.buildMenu.destroy();
      this.buildMenu=null;
    }
    this.events.emit("hideTooltip");
  }

  // ─── TOWER MENU ─────────────────────────────────────────────────
  openTowerMenu(tower) {
    this.closeTowerMenu(); this.closeBuildMenu();
    this.towerMenu = this.add.container(tower.sprite.x, tower.sprite.y).setDepth(50);

    const bg=this.add.circle(0,0,96,0x000000,0.88).setStrokeStyle(1,0x00ffcc,0.3);
    this.towerMenu.add(bg);

    const td=towersData[tower.type];
    this.towerMenu.add(this.add.text(0,-52,td?td.name:tower.type.toUpperCase(),{
      fontSize:"13px",fontFamily:"'Orbitron',sans-serif",color:"#00ffcc",fontStyle:"bold",
    }).setOrigin(0.5));
    this.towerMenu.add(this.add.text(0,-36,`LVL ${tower.level} / ${tower.maxLevel}`,{
      fontSize:"11px",fontFamily:"'Share Tech Mono',monospace",color:"#888",
    }).setOrigin(0.5));

    const upgCost = Math.floor(40 * tower.level * 1.4);
    const maxed   = tower.level >= tower.maxLevel;

    // ── UPGRADE BUTTON ──
    const upBtn     = this.add.circle(-48,22,26,0x002200).setStrokeStyle(2,0x00ff44).setInteractive();
    const upIcon    = this.add.text(-48,16,"▲",{ fontSize:"14px",fontFamily:"'Orbitron',sans-serif",color:"#224422" }).setOrigin(0.5);
    const upCostTxt = this.add.text(-48,32,`⬡ ${upgCost}`,{ fontSize:"12px",fontFamily:"'Orbitron',sans-serif",color:"#443300",fontStyle:"bold" }).setOrigin(0.5);

    const refreshUpgrade = () => {
      if (maxed) {
        upBtn.setFillStyle(0x112211).setStrokeStyle(2,0x336633);
        upIcon.setText("MAX").setFontSize("9px").setColor("#336633");
        upCostTxt.setText("");
        return;
      }
      const can = this.gold >= upgCost;
      upBtn.setFillStyle(can ? 0x005500 : 0x002200);
      upIcon.setColor(can ? "#00ff44" : "#224422");
      upCostTxt.setColor(can ? "#ffd700" : "#443300");
    };
    refreshUpgrade();

    upBtn.on("pointerover", () => { if(!maxed && this.gold >= upgCost) upBtn.setFillStyle(0x007700); });
    upBtn.on("pointerout",  () => refreshUpgrade());
    upBtn.on("pointerdown", () => {
      if(maxed){ this.showMessage("Already Max Level!"); return; }
      if(this.gold < upgCost){ this.showMessage("Not enough gold!"); return; }
      tower.upgrade(upgCost); this.closeTowerMenu();
    });

    // ── SELL BUTTON ──
    const sellVal    = Math.floor((td?.cost||50)*0.6);
    const sellBtn    = this.add.circle(48,22,26,0x330000).setStrokeStyle(2,0xff4444).setInteractive();
    const sellIcon   = this.add.text(48,16,"$",{ fontSize:"14px",fontFamily:"'Orbitron',sans-serif",color:"#ff6666" }).setOrigin(0.5);
    const sellCostTxt= this.add.text(48,32,`⬡ ${sellVal}`,{ fontSize:"12px",fontFamily:"'Orbitron',sans-serif",color:"#ffd700",fontStyle:"bold" }).setOrigin(0.5);
    sellBtn.on("pointerover", ()=>sellBtn.setFillStyle(0x550000));
    sellBtn.on("pointerout",  ()=>sellBtn.setFillStyle(0x330000));
    sellBtn.on("pointerdown", ()=>{
      this.gold+=sellVal; this.events.emit("goldUpdate",this.gold);
      const pad=this.buildPads.find(p=>p.tower===tower);
      if(pad){ pad.hasTower=false; pad.tower=null; pad.setAlpha(0.65); }
      tower.destroy(); this.towers.splice(this.towers.indexOf(tower),1);
      this.closeTowerMenu(); this.showMessage(`Sold for ⬡ ${sellVal}`);
    });

    // ── CLOSE ──
    const closeBtn = this.add.circle(0,-78,12,0x111111).setStrokeStyle(1,0x555555).setInteractive();
    const closeTxt = this.add.text(0,-78,"✕",{ fontSize:"10px",color:"#888" }).setOrigin(0.5);
    closeBtn.on("pointerdown", ()=>this.closeTowerMenu());

    [upBtn,upIcon,upCostTxt,sellBtn,sellIcon,sellCostTxt,closeBtn,closeTxt]
      .forEach(o=>this.towerMenu.add(o));

    // Refresh upgrade button whenever gold changes
    this.events.on("goldUpdate", refreshUpgrade);
    this.towerMenu._goldListener = refreshUpgrade;

    this.towerMenu.setScale(0);
    this.tweens.add({targets:this.towerMenu,scale:1,duration:160,ease:"Back.Out"});
  }

  closeTowerMenu() {
    if(this.towerMenu){
      if(this.towerMenu._goldListener) this.events.off("goldUpdate", this.towerMenu._goldListener);
      this.towerMenu.destroy();
      this.towerMenu=null;
    }
  }

  // ─── PLACE TOWER ────────────────────────────────────────────────
  placeTower(x,y,type){
    const cfg=towersData[type];
    if(this.gold<cfg.cost){this.showMessage("Not enough gold!");return null;}
    const tower=new Tower(this,x,y,cfg,type);
    this.gold-=cfg.cost; this.events.emit("goldUpdate",this.gold);
    this.towers.push(tower);
    const flash=this.add.circle(x,y,28,cfg.color,0.5);
    this.tweens.add({targets:flash,radius:55,alpha:0,duration:280,onComplete:()=>flash.destroy()});
    return tower;
  }

  // ─── ENEMY SPAWN ────────────────────────────────────────────────
  spawnEnemy(type){
    const cfg=ENEMIES[type];
    if(!cfg){console.warn("Unknown enemy type:",type);return;}
    this.enemies.push(new Enemy(this,this.path,cfg,this.waveManager.waveNumber));
  }

  // ─── ORBITAL ────────────────────────────────────────────────────
  activateOrbitalMode(){
    this._orbitalTargeting=true;
    this.closeBuildMenu(); this.closeTowerMenu();
    this.showMessage("◎ CLICK TARGET AREA","#cc88ff");
    this.input.once("pointerup",(pointer)=>{
      this._orbitalTargeting=false;
      const cam=this.cameras.main;
      const wx=(pointer.x-cam.x)/cam.zoom+cam.scrollX;
      const wy=(pointer.y-cam.y)/cam.zoom+cam.scrollY;
      this.fireOrbital(wx,wy);
    });
  }

  fireOrbital(x,y){
    const radius=130,damage=500;
    const burst=this.add.circle(x,y,radius*0.3,0xffffff,0.9).setDepth(30).setScale(0.1);
    const ring1=this.add.circle(x,y,radius,0xcc88ff,0.5).setDepth(30).setScale(0.1);
    const ring2=this.add.circle(x,y,radius*1.2,0x8844ff,0.3).setDepth(29).setScale(0.1);

    AudioManager.playSFX("sfx_orbital", 0.3);

    this.tweens.add({targets:burst,scaleX:1,scaleY:1,alpha:0,duration:250,ease:"Quad.Out",onComplete:()=>burst.destroy()});
    this.tweens.add({targets:ring1,scaleX:1,scaleY:1,alpha:0,duration:420,ease:"Quad.Out",onComplete:()=>ring1.destroy()});
    this.tweens.add({targets:ring2,scaleX:1,scaleY:1,alpha:0,duration:600,ease:"Quad.Out",onComplete:()=>ring2.destroy()});
    this.cameras.main.shake(280,0.011);
    let hits=0;
    this.enemies.forEach(e=>{
      if(Phaser.Math.Distance.Between(x,y,e.sprite.x,e.sprite.y)<=radius){e.takeDamage(damage);hits++;}
    });
    this.showMessage(hits>0?`ORBITAL HIT — ${hits} TARGETS`:"ORBITAL MISSED","#cc88ff");
    this.startOrbitalCooldown();
  }

  startOrbitalCooldown(){
    this.orbitalReady=false;
    this._orbitalCooldownStart=this.time.now;
    this.events.emit("orbitalCooldownStart");
  }

  orbitalCooldownProgress(){
    if(this.orbitalReady)return 1;
    return Math.min((this.time.now-this._orbitalCooldownStart)/this.orbitalCooldown,1);
  }

  // ─── UPDATE ─────────────────────────────────────────────────────
  update(time,delta){
    if(this.gameOver)return;

    for(let i=this.enemies.length-1;i>=0;i--){
      const e=this.enemies[i];
      if(!e.update(delta)){this.damageBase(e.baseDamage, e.typeConfig);e.destroy();this.enemies.splice(i,1);}
      else if(e.isDead() && !e._dead){this.killEnemy(e);}
    }
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i];
      if(p.update(delta)){p.destroy();this.projectiles.splice(i,1);}
    }

    this.waveManager.update();

    if(!this.orbitalReady&&this.orbitalCooldownProgress()>=1){
      this.orbitalReady=true;
      this.events.emit("orbitalReady");
      this.showMessage("◎ ORBITAL READY","#8888ff");
    }

    const pct=Math.max(0,this.baseHP/this.maxBaseHP);
    this.baseHPBar.width=70*pct;
    this.baseHPBar.setFillStyle(pct>0.5?0x00ff44:pct>0.25?0xffaa00:0xff2222);
    this.baseGlow.setAlpha(0.08+0.05*Math.sin(time*0.003));
  }

  // ─── KILL ENEMY ─────────────────────────────────────────────────
  killEnemy(enemy){
    // Remove from active list immediately so towers stop targeting it
    this.enemies.splice(this.enemies.indexOf(enemy), 1);

    this.gold  += enemy.reward; this.score += enemy.reward * 10;
    this.events.emit("goldUpdate", this.gold);
    this.events.emit("scoreUpdate", this.score);

    // Gold popup
    const px = enemy.sprite.x, py = enemy.sprite.y;
    const popup = this.add.text(px, py - 10, `+${enemy.reward}⬡`, {
      fontSize: "13px", fontFamily: "'Share Tech Mono',monospace", color: "#ffd700",
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: popup, y: popup.y - 26, alpha: 0, duration: 680,
      onComplete: () => popup.destroy() });

    // Play death animation (handles its own destroy when done)
    // If no death anim, playDeath calls destroy() immediately
    enemy.playDeath(() => {
      // Small particle burst at death position
      const ex = this.add.circle(px, py, 4, enemy.typeConfig.color).setDepth(20);
      this.tweens.add({ targets: ex, radius: 22, alpha: 0, duration: 250,
        onComplete: () => ex.destroy() });
    });
  }

  // ─── DAMAGE BASE ────────────────────────────────────────────────
  damageBase(amount, typeConfig){
    const shakeIntensity = Math.min(0.006 + amount * 0.003, 0.022);
    this.cameras.main.shake(160 + amount * 40, shakeIntensity);

    // Play damage animation on core sprite, or flash the rectangle
    if (this._usingCoreSprite) {
      if (this.anims.exists("core_hit")) {
        this.base.play("core_hit");
        this.base.once("animationcomplete", () => {
          if (this.base?.active && this.anims.exists("core_idle")) {
            this.base.play("core_idle");
          }
        });
      }
    } else {
      this.base.setFillStyle(0xff0000);
      this.time.delayedCall(110, () => { if (this.base?.active) this.base.setFillStyle(COLORS.base); });
      // Brief red tint
      this.base.setTint(0xff6666);
      this.time.delayedCall(200, () => { if (this.base?.active) this.base.clearTint(); });
    }

    this.baseHP -= amount;
    this.events.emit("hpUpdate", this.baseHP, this.maxBaseHP);

    // Screen flash — stronger for bosses
    const flashAlpha = Math.min(0.08 + amount * 0.03, 0.28);
    const flash = this.add.rectangle(W/2, H/2, W, H, 0xff0000, flashAlpha).setDepth(100);
    this.tweens.add({ targets: flash, alpha: 0, duration: 320 + amount * 40,
      onComplete: () => flash.destroy() });

    // Damage number floating up
    const dmgColor = amount >= 5 ? "#ff2222" : amount >= 2 ? "#ff8800" : "#ff4444";
    const dmgTxt = this.add.text(this.baseX, this.baseY - 30, `-${amount} HP`, {
      fontSize: amount >= 5 ? "22px" : "16px",
      fontFamily: "'Orbitron', sans-serif",
      color: dmgColor, fontStyle: "bold", stroke: "#000000", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(105);
    this.tweens.add({ targets: dmgTxt, y: dmgTxt.y - 40, alpha: 0, duration: 900,
      ease: "Quad.Out", onComplete: () => dmgTxt.destroy() });

    if (this.baseHP <= 0) this.triggerGameOver();
  }

  // ─── WAVE EVENTS ────────────────────────────────────────────────
  waveAnnounce(num){
    this.events.emit("waveUpdate",num);
    const ann=this.add.text(W/2,H/2-40,`— WAVE ${num} —`,{
      fontSize:"32px",fontFamily:"'Orbitron',sans-serif",
      color:"#ffffff",fontStyle:"bold",stroke:"#00ffcc",strokeThickness:1,
    }).setOrigin(0.5).setAlpha(0).setDepth(80);
    this.tweens.add({
      targets:ann,alpha:1,y:ann.y-14,duration:320,ease:"Quad.Out",
      onComplete:()=>this.tweens.add({targets:ann,alpha:0,y:ann.y-14,delay:900,duration:380,onComplete:()=>ann.destroy()}),
    });
  }

  setWaveStatus(text){this.events.emit("waveStatus",text);}

  // ─── COUNTDOWN ─────────────────────────────────────────────────
  _showCountdown(n,onDone){
    if(n<=0){onDone();return;}
    const t=this.add.text(W/2,H/2,`${n}`,{
      fontSize:"80px",fontFamily:"'Orbitron',sans-serif",
      color:"#00ffcc",stroke:"#003322",strokeThickness:3,
    }).setOrigin(0.5).setDepth(90).setAlpha(0).setScale(1.4);
    this.tweens.add({
      targets:t,alpha:1,scaleX:0.85,scaleY:0.85,duration:280,ease:"Quad.Out",
      onComplete:()=>this.tweens.add({
        targets:t,alpha:0,duration:350,delay:320,ease:"Quad.In",
        onComplete:()=>{t.destroy();this._showCountdown(n-1,onDone);},
      }),
    });
  }

  // ─── GAME OVER ─────────────────────────────────────────────────
  triggerGameOver(){
    this.gameOver=true; this.time.timeScale=1;
    this.game.loop.timeScale = 1; // reset speed control
    this.time.removeAllEvents();
    const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(90);
    this.tweens.add({targets:ov,alpha:0.72,duration:500});
    this.add.rectangle(W/2,H/2,500,300,0x06060f).setStrokeStyle(2,0xff2222,0.85).setDepth(91);
    this.add.text(W/2,H/2-90,"MISSION FAILED",{
      fontSize:"36px",fontFamily:"'Orbitron',sans-serif",color:"#ff2222",fontStyle:"bold",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-44, LEVEL_LORE[this.levelId]?.name || `LEVEL ${this.levelId}`,{
      fontSize:"13px",fontFamily:"'Share Tech Mono',monospace",color:"#aabbcc",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-18,`WAVE ${this.waveManager.waveNumber}  •  SCORE ${this.score}`,{
      fontSize:"15px",fontFamily:"'Share Tech Mono',monospace",color:"#888",
    }).setOrigin(0.5).setDepth(92);

    this._gameOverBtn(W/2-90,H/2+50,"RETRY",0x1a0000,0xff2222,"#ff4444",()=>{
      this.scene.stop("UIScene"); this.scene.restart();
    });
    this._gameOverBtn(W/2+90,H/2+50,"MENU",0x0a0a22,0x4444ff,"#aaaaff",()=>{
      this.scene.stop("UIScene"); this.scene.start("BootScene");
    });
  }

  levelComplete(){
    this.gameOver=true; this.time.timeScale=1;
    this.game.loop.timeScale = 1; // reset speed control

    // Save progress — this is the critical call
    SaveManager.completeLevel(this.levelId, this.score);

    const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(90);
    this.tweens.add({targets:ov,alpha:0.72,duration:500});
    this.add.rectangle(W/2,H/2,520,310,0x030d06).setStrokeStyle(2,0x00ff44,0.85).setDepth(91);
    this.add.text(W/2,H/2-90,"SECTOR CLEARED",{
      fontSize:"36px",fontFamily:"'Orbitron',sans-serif",color:"#00ff44",fontStyle:"bold",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-48,this.levelData?.name || `LEVEL ${this.levelId}`,{
      fontSize:"13px",fontFamily:"'Share Tech Mono',monospace",color:"#aabbcc",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-20,`FINAL SCORE: ${this.score}`,{
      fontSize:"16px",fontFamily:"'Orbitron',monospace",color:"#aaffaa",fontStyle:"bold",
    }).setOrigin(0.5).setDepth(92);

    // Find the next level in the same act only
    const currentAct = ACTS.find(a => a.levelIds.includes(this.levelId));
    const actLevelIds = currentAct?.levelIds || [];
    const myIndexInAct = actLevelIds.indexOf(this.levelId);
    const nextInActId = myIndexInAct >= 0 && myIndexInAct < actLevelIds.length - 1
      ? actLevelIds[myIndexInAct + 1] : null;
    const nextLevel = nextInActId ? LEVELS.find(l => l.id === nextInActId) : null;

    if(nextLevel){
      this._gameOverBtn(W/2-100,H/2+52,"NEXT MISSION",0x001a00,0x00ff44,"#00ff66",()=>{
        this.scene.stop("UIScene");
        this.scene.start("GameScene",{levelId:nextLevel.id});
      });
    }
    this._gameOverBtn(nextLevel ? W/2+100 : W/2, H/2+52, "ACT MAP", 0x0a0a22, 0x4444ff, "#aaaaff",()=>{
      this.scene.stop("UIScene"); this.scene.start("ActHubScene");
    });
  }

  _gameOverBtn(x,y,label,fill,stroke,textColor,onClick){
    const w=nextLabel=>nextLabel.length>6?180:140;
    const btn=this.add.rectangle(x,y,w(label),44,fill).setStrokeStyle(2,stroke).setInteractive().setDepth(92);
    this.add.text(x,y,label,{
      fontSize:"13px",fontFamily:"'Orbitron',sans-serif",color:textColor,
    }).setOrigin(0.5).setDepth(93);
    btn.on("pointerover",()=>btn.setAlpha(0.8));
    btn.on("pointerout", ()=>btn.setAlpha(1));
    btn.on("pointerdown",()=>onClick());
  }

  // ─── FLOATING MESSAGE ──────────────────────────────────────────
  showMessage(text,color="#ffcc00"){
    const msg=this.add.text(W/2,92,text,{
      fontSize:"18px",fontFamily:"'Share Tech Mono',monospace",
      color,backgroundColor:"rgba(0,0,0,0.78)",padding:{x:14,y:6},
    }).setOrigin(0.5).setDepth(70);
    this.tweens.add({targets:msg,alpha:0,y:68,duration:1200,ease:"Quad.In",onComplete:()=>msg.destroy()});
  }
}