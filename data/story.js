/**
 * story.js — All narrative content, act definitions, and level lore.
 * Single source of truth for the Chrono Siege: Fractured storyline.
 */

export const GAME_TITLE    = "CHRONO SIEGE";
export const GAME_SUBTITLE = "F R A C T U R E D";

// ─── ACTS ────────────────────────────────────────────────────────────────────
export const ACTS = [
  {
    id: 1,
    name: "FIRST FRACTURE",
    theme: "Discovery & Confusion",
    tagline: "The machine that held time together just broke.",
    color: 0x00ffcc,
    colorHex: "#00ffcc",
    levelIds: [1, 2, 3],      // which levels belong to this act
    unlockRequirement: 0,      // levels completed in previous act needed to unlock

    // Full cinematic script — each entry is one "beat" on screen
    cinematic: [
      { type: "title",   text: "ACT I",                       duration: 1800 },
      { type: "title",   text: "FIRST FRACTURE",              duration: 2000 },
      { type: "line",    text: "2187 AD.",                    duration: 1600 },
      { type: "line",    text: "The Chrono Core — humanity's greatest achievement.", duration: 2200 },
      { type: "line",    text: "A machine built to stabilize time across all realities.", duration: 2200 },
      { type: "pause",                                         duration: 600  },
      { type: "line",    text: "It worked for eleven years.",  duration: 1800 },
      { type: "pause",                                         duration: 400  },
      { type: "line",    text: "Then we pushed it too far.",   duration: 2000 },
      { type: "pause",                                         duration: 500  },
      { type: "impact",  text: "THE CORE FRACTURED.",         duration: 2400 },
      { type: "pause",                                         duration: 700  },
      { type: "line",    text: "Alternate timelines began bleeding into ours.", duration: 2000 },
      { type: "line",    text: "Chaotic. Uncoordinated. But relentless.",       duration: 2000 },
      { type: "pause",                                         duration: 500  },
      { type: "line",    text: "You are the last Chrono Commander.",            duration: 2000 },
      { type: "line",    text: "Hold the line. Preserve our reality.",          duration: 2000 },
      { type: "prompt",  text: "BEGIN MISSION",                duration: 0    },
    ],
  },

  {
    id: 2,
    name: "THE BLEED",
    theme: "Escalation & Organization",
    tagline: "They've noticed us. Now they're coming deliberately.",
    color: 0xff6600,
    colorHex: "#ff6600",
    levelIds: [4, 5, 6],
    unlockRequirement: 3,

    cinematic: [
      { type: "title",   text: "ACT II",                      duration: 1800 },
      { type: "title",   text: "THE BLEED",                   duration: 2000 },
      { type: "line",    text: "The first breaches were accidents.",            duration: 2000 },
      { type: "line",    text: "Chaotic echoes from a broken machine.",         duration: 2000 },
      { type: "pause",                                         duration: 600  },
      { type: "impact",  text: "Not anymore.",                 duration: 2200 },
      { type: "pause",                                         duration: 500  },
      { type: "line",    text: "Other timelines have sensed the fracture.",     duration: 2200 },
      { type: "line",    text: "They see our weakness.",       duration: 1800 },
      { type: "line",    text: "Some are moving in deliberately.",              duration: 2000 },
      { type: "pause",                                         duration: 700  },
      { type: "line",    text: "The enemy is no longer chaotic.",               duration: 1800 },
      { type: "line",    text: "They are organized. They are learning.",        duration: 2000 },
      { type: "prompt",  text: "HOLD THE TIMELINE",           duration: 0    },
    ],
  },

  {
    id: 3,
    name: "COLLAPSE",
    theme: "Complexity & Instability",
    tagline: "The walls between realities are dissolving.",
    color: 0xaa44ff,
    colorHex: "#aa44ff",
    levelIds: [7, 8, 9],
    unlockRequirement: 3,

    cinematic: [
      { type: "title",   text: "ACT III",                     duration: 1800 },
      { type: "title",   text: "COLLAPSE",                    duration: 2000 },
      { type: "line",    text: "The fracture is no longer a crack.",            duration: 2000 },
      { type: "line",    text: "It's a wound. And it's spreading.",             duration: 2200 },
      { type: "pause",                                         duration: 700  },
      { type: "line",    text: "Multiple timelines are merging simultaneously.", duration: 2200 },
      { type: "line",    text: "Enemy types we've never encountered before.",   duration: 2000 },
      { type: "impact",  text: "Reality itself is becoming unstable.",          duration: 2400 },
      { type: "pause",                                         duration: 600  },
      { type: "line",    text: "But something else has emerged from the data.", duration: 2000 },
      { type: "line",    text: "A pattern. A signal. A warning.",               duration: 2000 },
      { type: "prompt",  text: "ENTER THE COLLAPSE",          duration: 0    },
    ],
  },

  {
    id: 4,
    name: "ECHO OF GUILT",
    theme: "Revelation & Moral Weight",
    tagline: "We didn't discover the fracture. We caused it.",
    color: 0xff2244,
    colorHex: "#ff2244",
    levelIds: [10, 11, 12],
    unlockRequirement: 3,

    cinematic: [
      { type: "title",   text: "ACT IV",                      duration: 1800 },
      { type: "title",   text: "ECHO OF GUILT",               duration: 2200 },
      { type: "pause",                                         duration: 800  },
      { type: "line",    text: "The signal was a record.",     duration: 1800 },
      { type: "line",    text: "The Chrono Core's final log before the fracture.", duration: 2200 },
      { type: "pause",                                         duration: 600  },
      { type: "impact",  text: "We caused this.",              duration: 2600 },
      { type: "pause",                                         duration: 900  },
      { type: "line",    text: "The Core didn't fail.",        duration: 1800 },
      { type: "line",    text: "We overloaded it — trying to control every timeline.", duration: 2400 },
      { type: "pause",                                         duration: 600  },
      { type: "line",    text: "The enemies we've been killing...",             duration: 2000 },
      { type: "line",    text: "...are defense systems. From other timelines.", duration: 2200 },
      { type: "line",    text: "Protecting their realities from us.",           duration: 2000 },
      { type: "pause",                                         duration: 800  },
      { type: "line",    text: "But if we stop fighting, our timeline dies.",   duration: 2200 },
      { type: "prompt",  text: "FACE THE TRUTH",               duration: 0    },
    ],
  },

  {
    id: 5,
    name: "EPOCH ZERO",
    theme: "Final Resolution",
    tagline: "One timeline to erase all others. Including ours.",
    color: 0xffffff,
    colorHex: "#ffffff",
    levelIds: [13, 14],
    unlockRequirement: 3,

    cinematic: [
      { type: "title",   text: "ACT V",                       duration: 1800 },
      { type: "title",   text: "EPOCH ZERO",                  duration: 2200 },
      { type: "pause",                                         duration: 900  },
      { type: "line",    text: "From the collapse, one force has emerged dominant.", duration: 2400 },
      { type: "line",    text: "The Prime Timeline.",          duration: 1800 },
      { type: "pause",                                         duration: 600  },
      { type: "line",    text: "It does not bleed. It does not fracture.",     duration: 2200 },
      { type: "impact",  text: "It erases.",                   duration: 2400 },
      { type: "pause",                                         duration: 800  },
      { type: "line",    text: "Every reality that ever was, being unmade.",   duration: 2200 },
      { type: "line",    text: "Every timeline — including ours.",              duration: 2000 },
      { type: "pause",                                         duration: 700  },
      { type: "line",    text: "Its vanguard is EPOCH-0.",     duration: 2000 },
      { type: "line",    text: "An entity that adapts. That learns. That remembers.", duration: 2400 },
      { type: "pause",                                         duration: 600  },
      { type: "line",    text: "This is the last timeline.",   duration: 2000 },
      { type: "prompt",  text: "MAKE IT COUNT",                duration: 0    },
    ],
  },
];

// ─── LEVEL LORE (keyed by level id) ─────────────────────────────────────────
export const LEVEL_LORE = {
  1: {
    name: "BREACH POINT ZERO",
    subtitle: "First contact with the unknown",
    lore: "The Core just broke.\nThe first distortions are weak — echoes more than entities.\nLearn the defense systems. This is where it starts.",
  },
  2: {
    name: "THE GAUNTLET",
    subtitle: "No safe ground",
    lore: "The fracture is widening.\nThey're pouring through a winding corridor in spacetime.\nEvery turn is contested. No position is safe.",
  },
  3: {
    name: "SIGNAL LOST",
    subtitle: "The Core goes silent",
    lore: "Contact with the Chrono Core has been severed.\nYou're defending blind.\nThe distortions are getting faster. Smarter.",
  },
  4: {
    name: "COORDINATED STRIKE",
    subtitle: "They are no longer accidents",
    lore: "These aren't random echoes anymore.\nSomething in another timeline is directing them.\nHold the perimeter.",
  },
  5: {
    name: "PHANTOM GRID",
    subtitle: "Fast. Invisible. Everywhere.",
    lore: "A new class of entity has emerged from the bleed.\nPhantoms — temporal ghosts that move faster than your targeting systems.\nAdapt or lose.",
  },
  6: {
    name: "THE COMMANDER",
    subtitle: "First organized assault",
    lore: "Intelligence confirms it: the invasions have a commander.\nThis wave is the first fully coordinated strike.\nBrace for the mini-boss.",
  },
  7: {
    name: "REALITY BLURS",
    subtitle: "The walls between timelines dissolve",
    lore: "Multiple timelines are bleeding simultaneously now.\nEnemies from different realities — side by side.\nYour towers weren't designed for this.",
  },
  8: {
    name: "THE UNSTABLE ZONE",
    subtitle: "Nothing here behaves as expected",
    lore: "This sector of spacetime is critically unstable.\nEnemies are mutating as they pass through.\nFast-tank hybrids. Expect the unexpected.",
  },
  9: {
    name: "CONVERGENCE NODE",
    subtitle: "All timelines point here",
    lore: "This is the focal point.\nEvery collapsing timeline is funneling through this single node.\nSurvive this, and we might find answers.",
  },
  10: {
    name: "MIRROR BREACH",
    subtitle: "Fighting our own reflection",
    lore: "The log was clear.\nThose entities bearing down on us — they're defending their homes.\nJust like we are.\nIt doesn't change what we have to do.",
  },
  11: {
    name: "THE WEIGHT OF IT",
    subtitle: "Every kill has a cost",
    lore: "We know the truth now.\nThe other timelines know it too — they can sense our guilt.\nThey're pressing harder because of it.",
  },
  12: {
    name: "LAST CONFESSION",
    subtitle: "No absolution. Only survival.",
    lore: "The final push before Epoch Zero makes itself known.\nWhatever we've done — whatever we are — this is the consequence.\nWe hold. Or everything ends.",
  },
  13: {
    name: "EPOCH VANGUARD",
    subtitle: "The eraser arrives",
    lore: "EPOCH-0's advance forces are here.\nThey don't bleed. They don't fracture.\nThey simply remove what shouldn't exist.",
  },
  14: {
    name: "THE LAST TIMELINE",
    subtitle: "End of everything",
    lore: "EPOCH-0 itself.\nIt has studied every wave you've survived.\nIt knows your towers. It knows your patterns.\nThis is the last timeline. Hold it.",
  },
};