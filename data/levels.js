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
    mapKey: "act1_level1",
    pathColor: 0x00ffcc,
    startGold: 150,
    baseHP: 20,


    waves: [
      // Waves 1–3: Orientation. Sparse, slow, survivable without towers.
      [{ type: "scout", count: 4, interval: 1100 }],
      [{ type: "scout", count: 7, interval: 900 }],
      [{ type: "scout", count: 6, interval: 800 }, { type: "runner", count: 2, interval: 1000 }],
      // Waves 4–6: Runners start slipping through. Brutes introduced.
      [{ type: "scout", count: 8, interval: 750 }, { type: "runner", count: 4, interval: 750 }],
      [{ type: "brute", count: 2, interval: 1600 }, { type: "scout", count: 6, interval: 750 }],
      [{ type: "runner", count: 8, interval: 650 }, { type: "brute", count: 2, interval: 1500 }],
      // Waves 7–9: Mixed pressure builds. No safe moment.
      [{ type: "brute", count: 3, interval: 1400 }, { type: "runner", count: 7, interval: 650 }],
      [{ type: "scout", count: 10, interval: 650 }, { type: "brute", count: 3, interval: 1300 }],
      [{ type: "runner", count: 9, interval: 580 }, { type: "brute", count: 4, interval: 1200 }],
      // Wave 10: First colossus. Scouts screen for it.
      [{ type: "scout", count: 7, interval: 650 }, { type: "colossus", count: 1, interval: 0 }],
    ],
  },

  {
    id: 2,
    mapKey: "act1_level2",
    pathColor: 0x00ccff,
    startGold: 160,
    baseHP: 20,

    // Winding S-curve — more corners, less direct coverage


    waves: [
      // Waves 1–3: Familiar enemy types, unfamiliar map.
      [{ type: "scout",  count: 7,  interval: 800 }],
      [{ type: "runner", count: 5,  interval: 750 }, { type: "scout", count: 4, interval: 750 }],
      [{ type: "brute",  count: 2,  interval: 1500 }, { type: "runner", count: 7, interval: 650 }],
      // Waves 4–6: Phantoms appear — fast, hard to intercept mid-path.
      [{ type: "phantom", count: 3, interval: 950 }, { type: "scout", count: 8, interval: 700 }],
      [{ type: "phantom", count: 5, interval: 850 }, { type: "brute", count: 3, interval: 1400 }],
      [{ type: "runner",  count: 10,interval: 600 }, { type: "phantom", count: 4, interval: 800 }],
      // Waves 7–9: Everything at once. Corners get overwhelmed.
      [{ type: "brute",   count: 5, interval: 1200 }, { type: "phantom", count: 5, interval: 750 }],
      [{ type: "scout",   count: 12,interval: 580 }, { type: "runner", count: 6, interval: 600 }],
      [{ type: "runner",  count: 8, interval: 580 }, { type: "brute", count: 5, interval: 1100 }, { type: "phantom", count: 3, interval: 800 }],
      // Wave 10: Boss escorted.
      [{ type: "phantom", count: 4, interval: 800 }, { type: "runner", count: 6, interval: 600 }, { type: "colossus", count: 1, interval: 0 }],
    ],
  },

  {
    id: 3,
    mapKey: "act1_level3",
    pathColor: 0x00ffaa,
    startGold: 170,
    baseHP: 22,

    // Outer ring with a centre cut — enemies loop the perimeter then cut inward


    waves: [
      // Waves 1–3: The outer ring gives them long approach time — use it.
      [{ type: "scout", count: 8, interval: 750 }, { type: "runner", count: 3, interval: 800 }],
      [{ type: "runner", count: 8, interval: 700 }, { type: "scout", count: 6, interval: 700 }],
      [{ type: "brute", count: 3, interval: 1400 }, { type: "runner", count: 8, interval: 650 }],
      // Waves 4–6: Phantoms exploit the inner cut — hardest segment to cover.
      [{ type: "phantom", count: 5, interval: 850 }, { type: "brute", count: 3, interval: 1300 }],
      [{ type: "phantom", count: 7, interval: 780 }, { type: "runner", count: 8, interval: 620 }],
      [{ type: "brute",   count: 5, interval: 1200 }, { type: "phantom", count: 5, interval: 750 }],
      // Waves 7–9: Triple-threat waves. Corners are now critical.
      [{ type: "scout",  count: 12, interval: 600 }, { type: "brute",   count: 4, interval: 1200 }, { type: "phantom", count: 3, interval: 800 }],
      [{ type: "runner", count: 10, interval: 580 }, { type: "phantom", count: 6, interval: 720 }, { type: "brute", count: 3, interval: 1200 }],
      [{ type: "brute",  count: 6, interval: 1100 }, { type: "runner", count: 10, interval: 560 }],
      // Wave 10: Two colossus. The outer path is their advantage.
      [{ type: "scout", count: 6, interval: 700 }, { type: "phantom", count: 4, interval: 800 }, { type: "colossus", count: 2, interval: 6000 }],
    ],
  },

  {
    id: 4,
    mapKey: "act1_level4",
    pathColor: 0x44ffaa,
    startGold: 180,
    baseHP: 22,

    // Double-back canyon — narrow, punishing, no safe sides


    waves: [
      // The double-back means every tower covers two path segments — place early.
      [{ type: "scout",  count: 9,  interval: 750 }, { type: "runner", count: 4, interval: 800 }],
      [{ type: "runner", count: 9,  interval: 700 }, { type: "brute", count: 2, interval: 1500 }],
      [{ type: "brute",  count: 4,  interval: 1300 }, { type: "runner", count: 8, interval: 660 }],
      [{ type: "phantom",count: 5,  interval: 850 }, { type: "scout", count: 8, interval: 700 }],
      [{ type: "brute",  count: 4,  interval: 1200 }, { type: "phantom", count: 6, interval: 800 }],
      [{ type: "runner", count: 12, interval: 580 }, { type: "phantom", count: 5, interval: 750 }, { type: "brute", count: 2, interval: 1400 }],
      [{ type: "brute",  count: 6,  interval: 1100 }, { type: "runner", count: 10, interval: 580 }],
      [{ type: "phantom",count: 8,  interval: 720 }, { type: "brute", count: 5, interval: 1150 }],
      [{ type: "scout",  count: 14, interval: 550 }, { type: "runner", count: 8, interval: 580 }, { type: "phantom", count: 4, interval: 780 }],
      // Wave 10: Dense escort. The canyons bottleneck — orbital is gold here.
      [{ type: "brute", count: 5, interval: 1100 }, { type: "runner", count: 8, interval: 580 }, { type: "colossus", count: 1, interval: 0 }],
    ],
  },

  {
    id: 5,
    mapKey: "act1_level5",
    pathColor: 0x00ff88,
    startGold: 200,
    baseHP: 25,

    // Spiral inward — the most complex Act 1 layout. Each ring tightens.


    waves: [
      // The spiral means every enemy walks past your entire defence twice.
      // Early placement is critical — the core is exposed on the final stretch.
      [{ type: "scout",  count: 8,  interval: 750 }, { type: "runner", count: 5, interval: 780 }],
      [{ type: "runner", count: 10, interval: 680 }, { type: "brute", count: 2, interval: 1500 }],
      [{ type: "brute",  count: 3,  interval: 1400 }, { type: "phantom", count: 4, interval: 880 }],
      [{ type: "phantom",count: 6,  interval: 820 }, { type: "runner", count: 10, interval: 640 }],
      [{ type: "brute",  count: 5,  interval: 1200 }, { type: "phantom", count: 5, interval: 800 }],
      [{ type: "scout",  count: 14, interval: 560 }, { type: "brute", count: 4, interval: 1200 }],
      [{ type: "runner", count: 12, interval: 580 }, { type: "phantom", count: 7, interval: 750 }],
      [{ type: "brute",  count: 7,  interval: 1100 }, { type: "runner", count: 10, interval: 560 }, { type: "phantom", count: 3, interval: 820 }],
      // Wave 9: Full chaos — all types. This is the gauntlet before the boss.
      [{ type: "scout", count: 10, interval: 580 }, { type: "runner", count: 8, interval: 580 }, { type: "brute", count: 5, interval: 1100 }, { type: "phantom", count: 5, interval: 750 }],
      // Wave 10: The act's final statement. Two colossi, fully escorted.
      // If the Chrono Core falls here, Act 1 ends in failure.
      [{ type: "brute", count: 4, interval: 1100 }, { type: "runner", count: 8, interval: 560 }, { type: "phantom", count: 4, interval: 800 }, { type: "colossus", count: 2, interval: 8000 }],
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 2 — THE BLEED (stubs — levels 6–10)
  // Full layouts and waves to be built with the Level Editor
  // ═══════════════════════════════════════════════════════════════

  {
    id: 6,
    mapKey: "act2_level1",
    pathColor: 0xff6600,
    startGold: 200,
    baseHP: 28,
    waves: [
      [{ type: "scout", count: 10, interval: 700 }],
    ],
  },
];

// ─── ENEMY DEFINITIONS ───────────────────────────────────────────────────────
export const ENEMIES = {
  scout: {
    name: "SCOUT",    spriteKey: "enemy_scout",    usesRotation: false,
    hp: 80, speed: 0.00007, color: 0xff4455, reward: 8, radius: 11, baseDamage: 1,
    description: "Standard infiltration unit. Balanced in all ways — dangerous in numbers.",
  },
  runner: {
    name: "RUNNER",   spriteKey: "enemy_runner",   usesRotation: true,
    hp: 55, speed: 0.00013, color: 0xffff33, reward: 7, radius: 9, baseDamage: 1,
    description: "Fragile but fast. A single slip in coverage and it's through. Don't let them through.",
  },
  brute: {
    name: "BRUTE",    spriteKey: "enemy_brute",    usesRotation: false,
    hp: 380, speed: 0.000042, color: 0x44ff66, reward: 28, radius: 17, baseDamage: 2,
    description: "Walks through fire. Slow enough to hit — tough enough that you'll need every shot. TITAN towers preferred.",
  },
  phantom: {
    name: "PHANTOM",  spriteKey: "enemy_phantom",  usesRotation: false,
    hp: 90, speed: 0.00016, color: 0x88aaff, reward: 12, radius: 10, baseDamage: 1,
    description: "A temporal echo — barely there, devastatingly fast. STORM and APEX towers are your best answer.",
  },
  colossus: {
    name: "COLOSSUS", spriteKey: "enemy_colossus", usesRotation: false,
    hp: 3000, speed: 0.000038, color: 0xff00ff, reward: 250, radius: 24, baseDamage: 5,
    description: "A convergence point — multiple timelines collapsed into one unstoppable entity. Use your Orbital Strike. Focus everything.",
  },
};