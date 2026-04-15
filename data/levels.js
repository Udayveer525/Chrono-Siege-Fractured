/**
 * All level definitions. Each level has:
 *  - id, name, subtitle, lore  (narrative)
 *  - pathPoints                (enemy route)
 *  - buildPads                 (tower slots)
 *  - startGold, baseHP         (economy)
 *  - waves                     (that level's wave list)
 *  - bgColor, pathColor        (visual identity)
 */

export const LEVELS = [
  {
    id: 1,
    name: "SECTOR ZERO",
    subtitle: "The First Breach",
    lore: "Automated drones have breached the outer perimeter.\nDefend the energy core. This is where it begins.",
    bgColor: "#04040d",
    pathColor: 0x00ffcc,
    startGold: 150,
    baseHP: 20,

    pathPoints: [
      { x: 0,   y: 580 },
      { x: 980, y: 580 },
      { x: 980, y: 120 },
      { x: 220, y: 120 },
      { x: 220, y: 360 },
      { x: 760, y: 360 },
    ],

    buildPads: [
      { x: 160, y: 505 }, { x: 320, y: 505 }, { x: 480, y: 505 },
      { x: 640, y: 505 }, { x: 800, y: 505 },
      { x: 160, y: 645 }, { x: 320, y: 645 }, { x: 480, y: 645 },
      { x: 640, y: 645 }, { x: 800, y: 645 },
      { x: 895, y: 460 }, { x: 895, y: 300 },
      { x: 1065, y: 460 }, { x: 1065, y: 300 },
      { x: 860, y: 200 }, { x: 680, y: 200 },
      { x: 500, y: 200 }, { x: 340, y: 200 },
      { x: 370, y: 290 }, { x: 530, y: 290 }, { x: 690, y: 290 },
      { x: 370, y: 430 }, { x: 530, y: 430 }, { x: 690, y: 430 },
      { x: 130, y: 220 }, { x: 130, y: 460 },
    ],

    waves: [
      // Wave 1-3: Tutorial warmup — slow and few
      [{ type: "scout",  count: 5, interval: 900 }],
      [{ type: "scout",  count: 8, interval: 800 }],
      [{ type: "scout",  count: 6, interval: 700 }, { type: "runner", count: 3, interval: 900 }],
      // Wave 4-6: Introduce brutes
      [{ type: "scout",  count: 8, interval: 700 }, { type: "runner", count: 5, interval: 700 }],
      [{ type: "brute",  count: 3, interval: 1400 }, { type: "scout", count: 6, interval: 700 }],
      [{ type: "runner", count: 8, interval: 600 }, { type: "brute", count: 2, interval: 1400 }],
      // Wave 7-9: Pressure ramps
      [{ type: "brute",  count: 4, interval: 1200 }, { type: "runner", count: 8, interval: 600 }],
      [{ type: "scout",  count: 12, interval: 600 }, { type: "brute", count: 4, interval: 1200 }],
      [{ type: "runner", count: 10, interval: 550 }, { type: "brute", count: 5, interval: 1100 }],
      // Wave 10: Mini boss
      [{ type: "scout", count: 8, interval: 600 }, { type: "colossus", count: 1, interval: 0 }],
    ],
  },

  {
    id: 2,
    name: "THE GAUNTLET",
    subtitle: "No Safe Ground",
    lore: "They've learned your patterns.\nA new attack formation winds through the ruins.\nEvery corner is contested — there are no easy kills.",
    bgColor: "#0a0500",
    pathColor: 0xff6600,
    startGold: 175,
    baseHP: 25,

    // Spiral / winding path — more turns = more tower coverage opportunities
    pathPoints: [
      { x: 0,    y: 360 },   // enter centre-left
      { x: 240,  y: 360 },   // go right
      { x: 240,  y: 120 },   // go up
      { x: 700,  y: 120 },   // go right
      { x: 700,  y: 580 },   // go down
      { x: 400,  y: 580 },   // go left
      { x: 400,  y: 290 },   // go up
      { x: 960,  y: 290 },   // go right
      { x: 960,  y: 480 },   // go down
      { x: 1160, y: 480 },   // exit right → base
    ],

    buildPads: [
      // Along first horizontal (y=360)
      { x: 130, y: 290 }, { x: 130, y: 430 },

      // Along first vertical (x=240)
      { x: 160, y: 220 }, { x: 320, y: 220 },

      // Along top horizontal (y=120)
      { x: 460, y: 50  }, { x: 580, y: 50  },
      { x: 460, y: 200 }, { x: 580, y: 200 },

      // Along right vertical (x=700)
      { x: 610, y: 350 }, { x: 790, y: 350 },
      { x: 610, y: 480 }, { x: 790, y: 480 },

      // Along bottom horizontal (y=580)
      { x: 530, y: 510 }, { x: 530, y: 650 },
      { x: 630, y: 510 }, { x: 630, y: 650 },

      // Along second vertical (x=400)
      { x: 320, y: 400 }, { x: 480, y: 400 },

      // Along second horizontal (y=290)
      { x: 560, y: 220 }, { x: 720, y: 220 },
      { x: 560, y: 360 }, { x: 720, y: 360 },
      { x: 840, y: 220 }, { x: 840, y: 360 },

      // Near exit
      { x: 1060, y: 400 }, { x: 1060, y: 560 },
    ],

    waves: [
      // Wave 1-2: Reintro on harder map
      [{ type: "scout",  count: 8,  interval: 750 }],
      [{ type: "runner", count: 6,  interval: 700 }, { type: "scout", count: 4, interval: 700 }],
      // Wave 3-5: Mixed pressure
      [{ type: "brute",  count: 3,  interval: 1300 }, { type: "runner", count: 8, interval: 600 }],
      [{ type: "scout",  count: 10, interval: 650 }, { type: "brute",  count: 4, interval: 1200 }],
      [{ type: "runner", count: 12, interval: 550 }, { type: "brute",  count: 5, interval: 1100 }],
      // Wave 6-8: Introduce phantom (fast+hard to hit)
      [{ type: "phantom", count: 4, interval: 900 }, { type: "brute",  count: 3, interval: 1200 }],
      [{ type: "phantom", count: 6, interval: 800 }, { type: "runner", count: 8, interval: 600 }],
      [{ type: "brute",   count: 6, interval: 1100 }, { type: "phantom", count: 5, interval: 750 }],
      // Wave 9: Swarm
      [{ type: "scout",  count: 16, interval: 450 }, { type: "runner", count: 8, interval: 550 }],
      // Wave 10: Boss
      [{ type: "runner", count: 8, interval: 600 }, { type: "phantom", count: 4, interval: 800 }, { type: "colossus", count: 1, interval: 0 }],
      // Wave 11-13: Post-boss escalation
      [{ type: "brute",   count: 8,  interval: 1000 }, { type: "phantom", count: 6, interval: 700 }],
      [{ type: "phantom", count: 10, interval: 650 }, { type: "brute",   count: 6, interval: 1000 }],
      [{ type: "scout",   count: 14, interval: 500 }, { type: "brute",   count: 8, interval: 950 }],
      // Wave 14-15: Final push
      [{ type: "brute",   count: 10, interval: 900 }, { type: "phantom", count: 8, interval: 650 }],
      [{ type: "runner",  count: 10, interval: 500 }, { type: "phantom", count: 6, interval: 700 }, { type: "colossus", count: 2, interval: 5000 }],
    ],
  },
];

// Named enemy types — more flavourful than "basic/tank"
export const ENEMIES = {
  scout: {
    name: "SCOUT",
    hp: 80, speed: 0.00007, color: 0xff4455, reward: 8, radius: 11,
    description: "Standard unit. Balanced threat.",
  },
  runner: {
    name: "RUNNER",
    hp: 55,  speed: 0.00013, color: 0xffff33, reward: 7, radius: 9,
    description: "Fast and fragile. Don't let them slip through.",
  },
  brute: {
    name: "BRUTE",
    hp: 380, speed: 0.000042, color: 0x44ff66, reward: 28, radius: 17,
    description: "Slow but absorbs enormous damage. Use TITAN towers.",
  },
  phantom: {
    name: "PHANTOM",
    hp: 90,  speed: 0.00016, color: 0x88aaff, reward: 12, radius: 10,
    description: "Very fast. Prioritise with STORM and APEX towers.",
  },
  colossus: {
    name: "COLOSSUS",
    hp: 3000, speed: 0.000038, color: 0xff00ff, reward: 250, radius: 24,
    description: "Boss unit. Use Orbital Strike. Focus all fire.",
  },
};