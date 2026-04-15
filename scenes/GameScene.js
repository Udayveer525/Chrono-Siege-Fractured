import Enemy         from "../objects/Enemy.js";
import Tower         from "../objects/Tower.js";
import WaveManager   from "../managers/WaveManager.js";
import towersData    from "../data/towers.js";
import { LEVELS, ENEMIES } from "../data/levels.js";

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

    this.baseGlow = this.add.circle(this.baseX, this.baseY, 42, COLORS.base, 0.12);
    this.base = this.add.rectangle(this.baseX, this.baseY, 54, 54, COLORS.base);
    this.base.setStrokeStyle(2, COLORS.baseStroke).setDepth(2);
    this.add.text(this.baseX, this.baseY, "BASE", {
      fontSize: "10px", fontFamily: "'Orbitron', sans-serif", color: "#4488ff",
    }).setOrigin(0.5).setDepth(3);

    this.baseHPBarBg = this.add.rectangle(this.baseX, this.baseY+38, 58, 5, 0x111111);
    this.baseHPBarBg.setStrokeStyle(1, 0x333333).setDepth(3);
    this.baseHPBar = this.add.rectangle(this.baseX-29, this.baseY+38, 58, 5, 0x00ff44);
    this.baseHPBar.setOrigin(0,0.5).setDepth(4);
  }

  // ─── LEVEL INTRO ────────────────────────────────────────────────
  _showLevelIntro(onDone) {
    const ld = this.levelData;
    const panel = this.add.container(W/2, H/2).setDepth(200);

    const bg = this.add.rectangle(0, 0, 560, 300, 0x04040d, 0.96);
    bg.setStrokeStyle(1.5, this.levelData.pathColor, 0.7);
    panel.add(bg);

    // Level badge
    panel.add(Object.assign(this.add.text(-220, -110, `MISSION ${ld.id}`, {
      fontSize: "11px", fontFamily: "'Share Tech Mono', monospace", color: "#556",
    }).setOrigin(0,0.5)));

    panel.add(Object.assign(this.add.text(0, -74, ld.name, {
      fontSize: "30px", fontFamily: "'Orbitron', sans-serif",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#00ffcc", strokeThickness: 1,
    }).setOrigin(0.5)));

    panel.add(Object.assign(this.add.text(0, -38, ld.subtitle.toUpperCase(), {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace", color: "#00ffcc", letterSpacing: 3,
    }).setOrigin(0.5)));

    panel.add(Object.assign(this.add.rectangle(0, -14, 400, 1, 0x00ffcc, 0.2)));

    panel.add(Object.assign(this.add.text(0, 24, ld.lore, {
      fontSize: "12px", fontFamily: "'Share Tech Mono', monospace",
      color: "#778", align: "center", wordWrap: { width: 480 },
    }).setOrigin(0.5)));

    // Dismiss button
    const deployBtn = this.add.rectangle(0, 112, 200, 40, 0x001a11)
      .setStrokeStyle(1.5, 0x00ff66, 0.7).setInteractive();
    const deployTxt = this.add.text(0, 112, "▶  DEPLOY", {
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

    types.forEach((type, i) => {
      const angle=angles[i], bx=Math.cos(angle)*radius, by=Math.sin(angle)*radius;
      const cfg=towersData[type], canAfford=this.gold>=cfg.cost;

      const btn = this.add.circle(bx,by,28,cfg.color,canAfford?1:0.2)
        .setStrokeStyle(2,canAfford?0xffffff:0x333333).setInteractive();

      const nameTxt = this.add.text(bx,by,cfg.name,{
        fontSize:"7px",fontFamily:"'Orbitron',sans-serif",
        color:canAfford?"#fff":"#444",fontStyle:"bold",
      }).setOrigin(0.5);

      const costTxt = this.add.text(bx,by+40,`⬡ ${cfg.cost}`,{
        fontSize:"13px",fontFamily:"'Orbitron',sans-serif",
        color:canAfford?"#ffd700":"#665500",fontStyle:"bold",
      }).setOrigin(0.5);

      btn.on("pointerover", () => { if(!canAfford)return; btn.setScale(1.15); this.events.emit("showTooltip",cfg); });
      btn.on("pointerout",  () => { btn.setScale(1); this.events.emit("hideTooltip"); });
      btn.on("pointerdown", () => {
        if(!canAfford){this.showMessage("Not enough gold!");return;}
        const tower=this.placeTower(pad.x,pad.y,type);
        pad.tower=tower; pad.hasTower=true; pad.setAlpha(1);
        this.closeBuildMenu(); this.events.emit("hideTooltip");
      });

      this.buildMenu.add(btn); this.buildMenu.add(nameTxt); this.buildMenu.add(costTxt);
    });

    const cancelBtn=this.add.circle(0,0,16,0x330000).setStrokeStyle(1.5,0xff4444).setInteractive();
    const cancelTxt=this.add.text(0,0,"✕",{fontSize:"12px",color:"#ff4444"}).setOrigin(0.5);
    cancelBtn.on("pointerdown",()=>this.closeBuildMenu());
    this.buildMenu.add(cancelBtn); this.buildMenu.add(cancelTxt);

    this.buildMenu.setScale(0);
    this.tweens.add({targets:this.buildMenu,scale:1,duration:200,ease:"Back.Out"});
  }

  closeBuildMenu() {
    if(this.buildMenu){this.buildMenu.destroy();this.buildMenu=null;}
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

    const upgCost=Math.floor(40*tower.level*1.4);
    const maxed=tower.level>=tower.maxLevel, canUpg=!maxed&&this.gold>=upgCost;

    const upBtn=this.add.circle(-48,22,26,maxed?0x112211:(canUpg?0x005500:0x002200))
      .setStrokeStyle(2,maxed?0x336633:0x00ff44).setInteractive();
    const upIcon=this.add.text(-48,16,maxed?"MAX":"▲",{
      fontSize:maxed?"9px":"14px",fontFamily:"'Orbitron',sans-serif",
      color:maxed?"#336633":(canUpg?"#00ff44":"#224422"),
    }).setOrigin(0.5);
    const upCostTxt=this.add.text(-48,32,maxed?"":`⬡ ${upgCost}`,{
      fontSize:"12px",fontFamily:"'Orbitron',sans-serif",
      color:canUpg?"#ffd700":"#443300",fontStyle:"bold",
    }).setOrigin(0.5);
    upBtn.on("pointerover",()=>{if(canUpg)upBtn.setFillStyle(0x007700);});
    upBtn.on("pointerout", ()=>upBtn.setFillStyle(maxed?0x112211:(canUpg?0x005500:0x002200)));
    upBtn.on("pointerdown",()=>{
      if(maxed){this.showMessage("Already Max Level!");return;}
      if(!canUpg){this.showMessage("Not enough gold!");return;}
      tower.upgrade(upgCost); this.closeTowerMenu();
    });

    const sellVal=Math.floor((td?.cost||50)*0.6);
    const sellBtn=this.add.circle(48,22,26,0x330000).setStrokeStyle(2,0xff4444).setInteractive();
    const sellIcon=this.add.text(48,16,"$",{fontSize:"14px",fontFamily:"'Orbitron',sans-serif",color:"#ff6666"}).setOrigin(0.5);
    const sellCostTxt=this.add.text(48,32,`⬡ ${sellVal}`,{
      fontSize:"12px",fontFamily:"'Orbitron',sans-serif",color:"#ffd700",fontStyle:"bold",
    }).setOrigin(0.5);
    sellBtn.on("pointerover",()=>sellBtn.setFillStyle(0x550000));
    sellBtn.on("pointerout", ()=>sellBtn.setFillStyle(0x330000));
    sellBtn.on("pointerdown",()=>{
      this.gold+=sellVal; this.events.emit("goldUpdate",this.gold);
      const pad=this.buildPads.find(p=>p.tower===tower);
      if(pad){pad.hasTower=false;pad.tower=null;pad.setAlpha(0.65);}
      tower.destroy(); this.towers.splice(this.towers.indexOf(tower),1);
      this.closeTowerMenu(); this.showMessage(`Sold for ⬡ ${sellVal}`);
    });

    const closeBtn=this.add.circle(0,-78,12,0x111111).setStrokeStyle(1,0x555555).setInteractive();
    const closeTxt=this.add.text(0,-78,"✕",{fontSize:"10px",color:"#888"}).setOrigin(0.5);
    closeBtn.on("pointerdown",()=>this.closeTowerMenu());

    [upBtn,upIcon,upCostTxt,sellBtn,sellIcon,sellCostTxt,closeBtn,closeTxt].forEach(o=>this.towerMenu.add(o));

    this.towerMenu.setScale(0);
    this.tweens.add({targets:this.towerMenu,scale:1,duration:160,ease:"Back.Out"});
  }

  closeTowerMenu(){if(this.towerMenu){this.towerMenu.destroy();this.towerMenu=null;}}

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
      if(!e.update(delta)){this.damageBase(1);e.destroy();this.enemies.splice(i,1);}
      else if(e.isDead()){this.killEnemy(e);}
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
    this.baseHPBar.width=58*pct;
    this.baseHPBar.setFillStyle(pct>0.5?0x00ff44:pct>0.25?0xffaa00:0xff2222);
    this.baseGlow.setAlpha(0.08+0.05*Math.sin(time*0.003));
  }

  // ─── KILL ENEMY ─────────────────────────────────────────────────
  killEnemy(enemy){
    this.gold+=enemy.reward; this.score+=enemy.reward*10;
    this.events.emit("goldUpdate",this.gold);
    this.events.emit("scoreUpdate",this.score);

    const ex=this.add.circle(enemy.sprite.x,enemy.sprite.y,4,enemy.typeConfig.color).setDepth(20);
    this.tweens.add({targets:ex,radius:20,alpha:0,duration:240,onComplete:()=>ex.destroy()});

    const popup=this.add.text(enemy.sprite.x,enemy.sprite.y-10,`+${enemy.reward}⬡`,{
      fontSize:"13px",fontFamily:"'Share Tech Mono',monospace",color:"#ffd700",
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({targets:popup,y:popup.y-26,alpha:0,duration:680,onComplete:()=>popup.destroy()});

    enemy.destroy();
    this.enemies.splice(this.enemies.indexOf(enemy),1);
  }

  // ─── DAMAGE BASE ────────────────────────────────────────────────
  damageBase(amount){
    this.cameras.main.shake(160,0.006);
    this.base.setFillStyle(0xff0000);
    this.time.delayedCall(110,()=>{if(this.base?.active)this.base.setFillStyle(COLORS.base);});
    this.baseHP-=amount;
    this.events.emit("hpUpdate",this.baseHP,this.maxBaseHP);
    const flash=this.add.rectangle(W/2,H/2,W,H,0xff0000,0.1).setDepth(100);
    this.tweens.add({targets:flash,alpha:0,duration:320,onComplete:()=>flash.destroy()});
    if(this.baseHP<=0)this.triggerGameOver();
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
    this.gameOver=true; this.time.timeScale=1; this.time.removeAllEvents();
    const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(90);
    this.tweens.add({targets:ov,alpha:0.72,duration:500});
    this.add.rectangle(W/2,H/2,500,300,0x06060f).setStrokeStyle(2,0xff2222,0.85).setDepth(91);
    this.add.text(W/2,H/2-90,"MISSION FAILED",{
      fontSize:"36px",fontFamily:"'Orbitron',sans-serif",color:"#ff2222",fontStyle:"bold",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-44,this.levelData.name,{
      fontSize:"13px",fontFamily:"'Share Tech Mono',monospace",color:"#556",
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
    const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(90);
    this.tweens.add({targets:ov,alpha:0.72,duration:500});
    this.add.rectangle(W/2,H/2,500,300,0x030d06).setStrokeStyle(2,0x00ff44,0.85).setDepth(91);
    this.add.text(W/2,H/2-90,"SECTOR CLEARED",{
      fontSize:"36px",fontFamily:"'Orbitron',sans-serif",color:"#00ff44",fontStyle:"bold",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-44,this.levelData.name,{
      fontSize:"13px",fontFamily:"'Share Tech Mono',monospace",color:"#556",
    }).setOrigin(0.5).setDepth(92);
    this.add.text(W/2,H/2-18,`FINAL SCORE: ${this.score}`,{
      fontSize:"15px",fontFamily:"'Share Tech Mono',monospace",color:"#aaffaa",
    }).setOrigin(0.5).setDepth(92);

    // Next level button if available
    const nextLevel=LEVELS.find(l=>l.id===this.levelId+1);
    if(nextLevel){
      this._gameOverBtn(W/2-90,H/2+50,"NEXT LEVEL",0x001a00,0x00ff44,"#00ff66",()=>{
        this.scene.stop("UIScene");
        this.scene.start("GameScene",{levelId:nextLevel.id});
      });
    }
    this._gameOverBtn(nextLevel?W/2+90:W/2,H/2+50,"MENU",0x0a0a22,0x4444ff,"#aaaaff",()=>{
      this.scene.stop("UIScene"); this.scene.start("BootScene");
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