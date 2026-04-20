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
    levelIds: [1, 2, 3, 4, 5], // which levels belong to this act
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
    levelIds: [6, 7, 8],
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

  // ── ACT 1: FIRST FRACTURE ─────────────────────────────────────────────────

  1: {
    name: "BREACH POINT ZERO",
    subtitle: "The wound opens",
    lore: "Seven seconds ago, the Chrono Core went critical.\nThe first breach is small. Disorganised. Almost confused.\nThey don't know where they are yet.\n\nYou do. Keep it that way.",
  },
  2: {
    name: "THE WINDING",
    subtitle: "They are learning the geography",
    lore: "The distortions are adapting to our space.\nThey're no longer appearing at random — they're finding routes.\nThis corridor twists. Use that against them.\n\nEvery corner you hold is a second you buy.",
  },
  3: {
    name: "SIGNAL LOST",
    subtitle: "The Core goes dark",
    lore: "Core telemetry just dropped to zero.\nNo diagnostics. No status. No contact.\nWe are defending something we can no longer see or measure.\n\nThat means we defend it harder.",
  },
  4: {
    name: "THE CANYON RUN",
    subtitle: "Nowhere to hide. Nowhere to run.",
    lore: "The fracture has carved a deep corridor through spacetime.\nThere are no flanks here. No cover.\nEnemies walk the same path twice before reaching the Core.\n\nSo do your bullets. Plan accordingly.",
  },
  5: {
    name: "THE SPIRAL",
    subtitle: "The last stand of Act One",
    lore: "The breach has widened into a vortex.\nTimeline fragments are spiralling inward toward the Core — our Core.\nEvery ring they pass through tightens. Every wave is closer than the last.\n\nThis is where Act One ends.\nHold the spiral. Or lose everything that comes after.",
  },

  // ── ACT 2: THE BLEED ──────────────────────────────────────────────────────

  6: {
    name: "FIRST CONTACT",
    subtitle: "They came on purpose",
    lore: "The first breaches were accidents.\nThis one wasn't.\nSomething on the other side of the fracture found us — and sent something through deliberately.\n\nThe Bleed has begun.",
  },
  7: {
    name: "REALITY BLURS",
    subtitle: "The walls between timelines dissolve",
    lore: "Multiple timelines are bleeding simultaneously now.\nEnemies from different realities — side by side, none of them meant to coexist.\nYour towers weren't designed for this.\n\nNeither were you. Adapt.",
  },
  8: {
    name: "THE UNSTABLE ZONE",
    subtitle: "Nothing here behaves as expected",
    lore: "This sector of spacetime is critically unstable.\nEntities are mutating as they cross the threshold — fast-tank hybrids, things without names.\nThe rules you learned in Act One no longer apply.\n\nExpect the unexpected. Then expect worse.",
  },
  9: {
    name: "CONVERGENCE NODE",
    subtitle: "All timelines point here",
    lore: "Every collapsing timeline is funneling through this single coordinate.\nWe don't know why. We don't know what it means.\nBut whatever comes through that node next won't be small.\n\nSurvive this. Then we find answers.",
  },
  10: {
    name: "THE COMMANDER",
    subtitle: "It has a mind. It has a plan.",
    lore: "Intelligence analysis confirms it: the invasions have a commander.\nNot a creature. Not an echo. Something that thinks, coordinates, and adapts.\nThis wave is its opening move.\n\nDon't let it be its only one.",
  },

  // ── ACT 3: COLLAPSE ───────────────────────────────────────────────────────

  11: {
    name: "MIRROR BREACH",
    subtitle: "Fighting our own reflection",
    lore: "The data doesn't lie.\nThose entities — the ones we've been killing — they're not invaders.\nThey're defenders. From their timelines.\nProtecting their Cores the same way we're protecting ours.\n\nIt doesn't change what we have to do.",
  },
  12: {
    name: "THE WEIGHT OF IT",
    subtitle: "Every kill has a cost",
    lore: "We know the truth now.\nSo do they — they can sense our hesitation.\nAnd they're pressing harder because of it.\n\nGuilt is a luxury. Survival isn't.",
  },
  13: {
    name: "LAST CONFESSION",
    subtitle: "No absolution. Only survival.",
    lore: "This is the final push before Epoch Zero reveals itself.\nWhatever we've done — whatever we are — this is the consequence.\nThe timeline doesn't forgive. It just continues.\n\nWe hold. Or everything ends.",
  },

  // ── ACT 4: ECHO OF GUILT ──────────────────────────────────────────────────

  14: {
    name: "THE TRUTH OF IT",
    subtitle: "We caused this",
    lore: "The Core's final log is unambiguous.\nWe didn't discover the fracture. We caused it.\nWe overloaded the Core trying to control every timeline.\nAnd now every timeline is defending itself against us.\n\nFace it. Then fight anyway.",
  },
  15: {
    name: "ECHOES OF THE FALLEN",
    subtitle: "The dead don't stay dead here",
    lore: "Across fractured time, nothing ends cleanly.\nEntities we destroyed in earlier timelines are returning — altered, angrier.\nThe fracture is giving them back to us.\n\nWe owe them nothing. Survive.",
  },
  16: {
    name: "THE RECKONING",
    subtitle: "The other timelines know your name",
    lore: "They've had time to study us.\nEvery wave we've survived, every pattern we've used — they've watched.\nThis wave is a mirror of our own tactics, turned against us.\n\nYou can't out-plan yourself. So improvise.",
  },

  // ── ACT 5: EPOCH ZERO ─────────────────────────────────────────────────────

  17: {
    name: "EPOCH VANGUARD",
    subtitle: "The eraser arrives",
    lore: "EPOCH-0 doesn't send scouts.\nIt sends certainties.\nThese units don't bleed. They don't fracture. They don't retreat.\nThey simply remove what shouldn't exist.\n\nWe shouldn't exist. Prove them wrong.",
  },
  18: {
    name: "THE LAST TIMELINE",
    subtitle: "End of everything",
    lore: "EPOCH-0 itself.\nIt has analysed every wave you've survived, every tower you've built.\nIt knows your patterns. It's already countering them.\n\nThis is the last timeline.\nNot a metaphor. Not a mission briefing.\nThe last one.\n\nHold it.",
  },
};