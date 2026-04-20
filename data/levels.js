/**
 * levels.js — All level definitions.
 *
 * Act 1 — FIRST FRACTURE (levels 1–5)
 * Act 2 — THE BLEED      (levels 6–10)  [stubs, to be built]
 * ...
 */

export const LEVELS = [
  // ═══════════════════════════════════════════════════════════════
  // ACT 1 — FIRST FRACTURE
  // ═══════════════════════════════════════════════════════════════

  {
    id: 1,
    pathColor: 0x00ffcc,
    startGold: 150,
    baseHP: 20,

    // Classic Z-shaped path — gentle introduction, wide coverage
    pathPoints: [
      { x: 0, y: 580 },
      { x: 980, y: 580 },
      { x: 980, y: 120 },
      { x: 220, y: 120 },
      { x: 220, y: 360 },
      { x: 760, y: 360 },
    ],

    buildPads: [
      { x: 160, y: 505 },
      { x: 320, y: 505 },
      { x: 480, y: 505 },
      { x: 640, y: 505 },
      { x: 800, y: 505 },
      { x: 160, y: 645 },
      { x: 320, y: 645 },
      { x: 480, y: 645 },
      { x: 640, y: 645 },
      { x: 800, y: 645 },
      { x: 895, y: 460 },
      { x: 895, y: 300 },
      { x: 1065, y: 460 },
      { x: 1065, y: 300 },
      { x: 860, y: 200 },
      { x: 680, y: 200 },
      { x: 500, y: 200 },
      { x: 340, y: 200 },
      { x: 370, y: 290 },
      { x: 530, y: 290 },
      { x: 690, y: 290 },
      { x: 370, y: 430 },
      { x: 530, y: 430 },
      { x: 690, y: 430 },
      { x: 130, y: 220 },
      { x: 130, y: 460 },
    ],

    waves: [
      // Waves 1–3: Orientation. Sparse, slow, survivable without towers.
      [{ type: "scout", count: 4, interval: 1100 }],
      [{ type: "scout", count: 7, interval: 900 }],
      [
        { type: "scout", count: 6, interval: 800 },
        { type: "runner", count: 2, interval: 1000 },
      ],
      // Waves 4–6: Runners start slipping through. Brutes introduced.
      [
        { type: "scout", count: 8, interval: 750 },
        { type: "runner", count: 4, interval: 750 },
      ],
      [
        { type: "brute", count: 2, interval: 1600 },
        { type: "scout", count: 6, interval: 750 },
      ],
      [
        { type: "runner", count: 8, interval: 650 },
        { type: "brute", count: 2, interval: 1500 },
      ],
      // Waves 7–9: Mixed pressure builds. No safe moment.
      [
        { type: "brute", count: 3, interval: 1400 },
        { type: "runner", count: 7, interval: 650 },
      ],
      [
        { type: "scout", count: 10, interval: 650 },
        { type: "brute", count: 3, interval: 1300 },
      ],
      [
        { type: "runner", count: 9, interval: 580 },
        { type: "brute", count: 4, interval: 1200 },
      ],
      // Wave 10: First colossus. Scouts screen for it.
      [
        { type: "scout", count: 7, interval: 650 },
        { type: "colossus", count: 1, interval: 0 },
      ],
    ],
  },

  {
    id: 2,
    pathColor: 0x00ccff,
    startGold: 160,
    baseHP: 20,

    // Winding S-curve — more corners, less direct coverage
    pathPoints: [
      { x: 0, y: 360 },
      { x: 240, y: 360 },
      { x: 240, y: 120 },
      { x: 700, y: 120 },
      { x: 700, y: 580 },
      { x: 400, y: 580 },
      { x: 400, y: 290 },
      { x: 960, y: 290 },
      { x: 960, y: 480 },
      { x: 1160, y: 480 },
    ],

    buildPads: [
      { x: 130, y: 290 },
      { x: 130, y: 430 },
      { x: 160, y: 220 },
      { x: 320, y: 220 },
      { x: 460, y: 50 },
      { x: 580, y: 50 },
      { x: 460, y: 200 },
      { x: 580, y: 200 },
      { x: 610, y: 350 },
      { x: 790, y: 350 },
      { x: 610, y: 480 },
      { x: 790, y: 480 },
      { x: 530, y: 510 },
      { x: 530, y: 650 },
      { x: 630, y: 510 },
      { x: 630, y: 650 },
      { x: 320, y: 400 },
      { x: 480, y: 400 },
      { x: 560, y: 220 },
      { x: 720, y: 220 },
      { x: 560, y: 360 },
      { x: 720, y: 360 },
      { x: 840, y: 220 },
      { x: 840, y: 360 },
      { x: 1060, y: 400 },
      { x: 1060, y: 560 },
    ],

    waves: [
      // Waves 1–3: Familiar enemy types, unfamiliar map.
      [{ type: "scout", count: 7, interval: 800 }],
      [
        { type: "runner", count: 5, interval: 750 },
        { type: "scout", count: 4, interval: 750 },
      ],
      [
        { type: "brute", count: 2, interval: 1500 },
        { type: "runner", count: 7, interval: 650 },
      ],
      // Waves 4–6: Phantoms appear — fast, hard to intercept mid-path.
      [
        { type: "phantom", count: 3, interval: 950 },
        { type: "scout", count: 8, interval: 700 },
      ],
      [
        { type: "phantom", count: 5, interval: 850 },
        { type: "brute", count: 3, interval: 1400 },
      ],
      [
        { type: "runner", count: 10, interval: 600 },
        { type: "phantom", count: 4, interval: 800 },
      ],
      // Waves 7–9: Everything at once. Corners get overwhelmed.
      [
        { type: "brute", count: 5, interval: 1200 },
        { type: "phantom", count: 5, interval: 750 },
      ],
      [
        { type: "scout", count: 12, interval: 580 },
        { type: "runner", count: 6, interval: 600 },
      ],
      [
        { type: "runner", count: 8, interval: 580 },
        { type: "brute", count: 5, interval: 1100 },
        { type: "phantom", count: 3, interval: 800 },
      ],
      // Wave 10: Boss escorted.
      [
        { type: "phantom", count: 4, interval: 800 },
        { type: "runner", count: 6, interval: 600 },
        { type: "colossus", count: 1, interval: 0 },
      ],
    ],
  },

  {
    id: 3,
    pathColor: 0x00ffaa,
    startGold: 170,
    baseHP: 22,

    // Outer ring with a centre cut — enemies loop the perimeter then cut inward
    pathPoints: [
      { x: 0, y: 100 }, // enter top-left
      { x: 1100, y: 100 }, // sweep right across the top
      { x: 1100, y: 620 }, // drop down the right side
      { x: 600, y: 620 }, // cut left halfway
      { x: 600, y: 360 }, // rise to centre
      { x: 80, y: 360 }, // cut left to the inner left
      { x: 80, y: 620 }, // drop to bottom-left
      { x: 380, y: 620 }, // exit toward base
    ],

    buildPads: [
      // Top horizontal flank
      { x: 200, y: 190 },
      { x: 400, y: 190 },
      { x: 600, y: 190 },
      { x: 800, y: 190 },
      { x: 1000, y: 190 },
      { x: 200, y: 30 },
      { x: 500, y: 30 },
      { x: 800, y: 30 },
      // Right vertical flank
      { x: 980, y: 360 },
      { x: 1170, y: 360 },
      { x: 980, y: 510 },
      { x: 1170, y: 510 },
      // Bottom-right horizontal
      { x: 740, y: 520 },
      { x: 870, y: 520 },
      { x: 740, y: 660 },
      { x: 870, y: 660 },
      // Centre vertical (x=600)
      { x: 490, y: 490 },
      { x: 700, y: 490 },
      { x: 490, y: 360 },
      { x: 700, y: 360 },
      // Inner horizontal (y=360)
      { x: 280, y: 270 },
      { x: 450, y: 270 },
      { x: 280, y: 450 },
      { x: 450, y: 450 },
      // Left vertical (x=80)
      { x: 170, y: 490 },
      { x: 170, y: 620 },
      // Near base
      { x: 230, y: 660 },
      { x: 380, y: 530 },
    ],

    waves: [
      // Waves 1–3: The outer ring gives them long approach time — use it.
      [
        { type: "scout", count: 8, interval: 750 },
        { type: "runner", count: 3, interval: 800 },
      ],
      [
        { type: "runner", count: 8, interval: 700 },
        { type: "scout", count: 6, interval: 700 },
      ],
      [
        { type: "brute", count: 3, interval: 1400 },
        { type: "runner", count: 8, interval: 650 },
      ],
      // Waves 4–6: Phantoms exploit the inner cut — hardest segment to cover.
      [
        { type: "phantom", count: 5, interval: 850 },
        { type: "brute", count: 3, interval: 1300 },
      ],
      [
        { type: "phantom", count: 7, interval: 780 },
        { type: "runner", count: 8, interval: 620 },
      ],
      [
        { type: "brute", count: 5, interval: 1200 },
        { type: "phantom", count: 5, interval: 750 },
      ],
      // Waves 7–9: Triple-threat waves. Corners are now critical.
      [
        { type: "scout", count: 12, interval: 600 },
        { type: "brute", count: 4, interval: 1200 },
        { type: "phantom", count: 3, interval: 800 },
      ],
      [
        { type: "runner", count: 10, interval: 580 },
        { type: "phantom", count: 6, interval: 720 },
        { type: "brute", count: 3, interval: 1200 },
      ],
      [
        { type: "brute", count: 6, interval: 1100 },
        { type: "runner", count: 10, interval: 560 },
      ],
      // Wave 10: Two colossus. The outer path is their advantage.
      [
        { type: "scout", count: 6, interval: 700 },
        { type: "phantom", count: 4, interval: 800 },
        { type: "colossus", count: 2, interval: 6000 },
      ],
    ],
  },

  {
    id: 4,
    pathColor: 0x44ffaa,
    startGold: 180,
    baseHP: 22,

    // Double-back canyon — narrow, punishing, no safe sides
    pathPoints: [
      { x: 0, y: 200 }, // enter top
      { x: 850, y: 200 }, // sweep right
      { x: 850, y: 400 }, // drop down
      { x: 150, y: 400 }, // sweep all the way back left
      { x: 150, y: 600 }, // drop to bottom
      { x: 750, y: 600 }, // sweep right again
      { x: 1050, y: 600 }, // to base
    ],

    buildPads: [
      // Above top horizontal
      { x: 200, y: 110 },
      { x: 400, y: 110 },
      { x: 600, y: 110 },
      { x: 800, y: 110 },
      // Below top horizontal
      { x: 200, y: 290 },
      { x: 400, y: 290 },
      { x: 600, y: 290 },
      // Right turn zone
      { x: 940, y: 200 },
      { x: 940, y: 400 },
      // Above/below middle horizontal
      { x: 300, y: 310 },
      { x: 500, y: 310 },
      { x: 650, y: 310 },
      { x: 300, y: 490 },
      { x: 500, y: 490 },
      { x: 650, y: 490 },
      // Left turn zone
      { x: 60, y: 300 },
      { x: 60, y: 500 },
      // Above/below bottom horizontal
      { x: 350, y: 510 },
      { x: 550, y: 510 },
      { x: 750, y: 510 },
      { x: 350, y: 680 },
      { x: 550, y: 680 },
      { x: 750, y: 680 },
      // Near base
      { x: 960, y: 510 },
      { x: 960, y: 680 },
    ],

    waves: [
      // The double-back means every tower covers two path segments — place early.
      [
        { type: "scout", count: 9, interval: 750 },
        { type: "runner", count: 4, interval: 800 },
      ],
      [
        { type: "runner", count: 9, interval: 700 },
        { type: "brute", count: 2, interval: 1500 },
      ],
      [
        { type: "brute", count: 4, interval: 1300 },
        { type: "runner", count: 8, interval: 660 },
      ],
      [
        { type: "phantom", count: 5, interval: 850 },
        { type: "scout", count: 8, interval: 700 },
      ],
      [
        { type: "brute", count: 4, interval: 1200 },
        { type: "phantom", count: 6, interval: 800 },
      ],
      [
        { type: "runner", count: 12, interval: 580 },
        { type: "phantom", count: 5, interval: 750 },
        { type: "brute", count: 2, interval: 1400 },
      ],
      [
        { type: "brute", count: 6, interval: 1100 },
        { type: "runner", count: 10, interval: 580 },
      ],
      [
        { type: "phantom", count: 8, interval: 720 },
        { type: "brute", count: 5, interval: 1150 },
      ],
      [
        { type: "scout", count: 14, interval: 550 },
        { type: "runner", count: 8, interval: 580 },
        { type: "phantom", count: 4, interval: 780 },
      ],
      // Wave 10: Dense escort. The canyons bottleneck — orbital is gold here.
      [
        { type: "brute", count: 5, interval: 1100 },
        { type: "runner", count: 8, interval: 580 },
        { type: "colossus", count: 1, interval: 0 },
      ],
    ],
  },

  {
    id: 5,
    pathColor: 0x00ff88,
    startGold: 200,
    baseHP: 25,

    // Spiral inward — the most complex Act 1 layout. Each ring tightens.
    pathPoints: [
      { x: 0, y: 660 }, // enter bottom-left
      { x: 1150, y: 660 }, // sweep right along the bottom
      { x: 1150, y: 60 }, // rise up the right side
      { x: 100, y: 60 }, // sweep left along the top
      { x: 100, y: 540 }, // drop back down, inner ring
      { x: 900, y: 540 }, // sweep right, inner ring
      { x: 900, y: 180 }, // rise again, tighter
      { x: 300, y: 180 }, // sweep left, tighter still
      { x: 300, y: 420 }, // drop to core
      { x: 650, y: 420 }, // exit to base — the Chrono Core
    ],

    buildPads: [
      // Outer bottom
      { x: 230, y: 570 },
      { x: 460, y: 570 },
      { x: 690, y: 570 },
      { x: 920, y: 570 },
      { x: 230, y: 680 },
      { x: 460, y: 680 },
      { x: 690, y: 680 },
      { x: 920, y: 680 },
      // Right outer
      { x: 1040, y: 360 },
      { x: 1180, y: 360 },
      { x: 1040, y: 200 },
      { x: 1180, y: 200 },
      // Outer top
      { x: 350, y: 150 },
      { x: 600, y: 150 },
      { x: 850, y: 150 },
      { x: 350, y: 30 },
      { x: 600, y: 30 },
      { x: 850, y: 30 },
      // Left outer
      { x: 30, y: 300 },
      { x: 170, y: 300 },
      // Inner bottom ring
      { x: 500, y: 450 },
      { x: 700, y: 450 },
      { x: 500, y: 620 },
      { x: 700, y: 620 },
      // Inner right
      { x: 820, y: 360 },
      { x: 970, y: 360 },
      // Inner top
      { x: 450, y: 100 },
      { x: 650, y: 100 },
      { x: 450, y: 270 },
      { x: 650, y: 270 },
      // Core approach
      { x: 400, y: 330 },
      { x: 550, y: 330 },
      { x: 400, y: 510 },
      { x: 550, y: 510 },
    ],

    waves: [
      // The spiral means every enemy walks past your entire defence twice.
      // Early placement is critical — the core is exposed on the final stretch.
      [
        { type: "scout", count: 8, interval: 750 },
        { type: "runner", count: 5, interval: 780 },
      ],
      [
        { type: "runner", count: 10, interval: 680 },
        { type: "brute", count: 2, interval: 1500 },
      ],
      [
        { type: "brute", count: 3, interval: 1400 },
        { type: "phantom", count: 4, interval: 880 },
      ],
      [
        { type: "phantom", count: 6, interval: 820 },
        { type: "runner", count: 10, interval: 640 },
      ],
      [
        { type: "brute", count: 5, interval: 1200 },
        { type: "phantom", count: 5, interval: 800 },
      ],
      [
        { type: "scout", count: 14, interval: 560 },
        { type: "brute", count: 4, interval: 1200 },
      ],
      [
        { type: "runner", count: 12, interval: 580 },
        { type: "phantom", count: 7, interval: 750 },
      ],
      [
        { type: "brute", count: 7, interval: 1100 },
        { type: "runner", count: 10, interval: 560 },
        { type: "phantom", count: 3, interval: 820 },
      ],
      // Wave 9: Full chaos — all types. This is the gauntlet before the boss.
      [
        { type: "scout", count: 10, interval: 580 },
        { type: "runner", count: 8, interval: 580 },
        { type: "brute", count: 5, interval: 1100 },
        { type: "phantom", count: 5, interval: 750 },
      ],
      // Wave 10: The act's final statement. Two colossi, fully escorted.
      // If the Chrono Core falls here, Act 1 ends in failure.
      [
        { type: "brute", count: 4, interval: 1100 },
        { type: "runner", count: 8, interval: 560 },
        { type: "phantom", count: 4, interval: 800 },
        { type: "colossus", count: 2, interval: 8000 },
      ],
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 2 — THE BLEED (stubs — levels 6–10)
  // Full layouts and waves to be built with the Level Editor
  // ═══════════════════════════════════════════════════════════════

  {
    id: 6,
    pathColor: 0xff6600,
    startGold: 200,
    baseHP: 28,
    pathPoints: [
      { x: 0, y: 360 },
      { x: 1160, y: 360 },
    ],
    buildPads: [],
    waves: [[{ type: "scout", count: 10, interval: 700 }]],
  },
];

// ─── ENEMY DEFINITIONS ───────────────────────────────────────────────────────
export const ENEMIES = {
  scout: {
    name: "SCOUT",
    spriteKey: "enemy_scout",
    hp: 80,
    speed: 0.00007,
    color: 0xff4455,
    reward: 8,
    radius: 11,
    baseDamage: 1,
    usesRotation: false,
    description:
      "Standard infiltration unit. Balanced in all ways — dangerous in numbers.",
  },
  runner: {
    name: "RUNNER",
    spriteKey: "enemy_runner",
    hp: 55,
    speed: 0.00013,
    color: 0xffff33,
    reward: 7,
    radius: 9,
    baseDamage: 1,
    usesRotation: true,
    description:
      "Fragile but fast. A single slip in coverage and it's through. Don't let them through.",
  },
  brute: {
    name: "BRUTE",
    spriteKey: "enemy_brute",
    hp: 380,
    speed: 0.000042,
    color: 0x44ff66,
    reward: 28,
    radius: 17,
    baseDamage: 2,
    usesRotation: false,
    description:
      "Walks through fire. Slow enough to hit — tough enough that you'll need every shot. TITAN towers preferred.",
  },
  phantom: {
    name: "PHANTOM",
    spriteKey: "enemy_phantom",
    hp: 90,
    speed: 0.00016,
    color: 0x88aaff,
    reward: 12,
    radius: 10,
    baseDamage: 1,
    usesRotation: false,
    description:
      "A temporal echo — barely there, devastatingly fast. STORM and APEX towers are your best answer.",
  },
  colossus: {
    name: "COLOSSUS",
    spriteKey: "enemy_colossus",
    hp: 3000,
    speed: 0.000038,
    color: 0xff00ff,
    reward: 250,
    radius: 24,
    baseDamage: 5,
    usesRotation: false,
    description:
      "A convergence point — multiple timelines collapsed into one unstoppable entity. Use your Orbital Strike. Focus everything.",
  },
};
