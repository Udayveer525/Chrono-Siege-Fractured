/**
 * SaveManager — localStorage wrapper for campaign progress.
 * 
 * Save structure:
 * {
 *   completed:   number[],   // level ids completed
 *   bestScores:  { [levelId]: number },
 *   totalScore:  number,
 *   firstRun:    boolean,
 * }
 */

const KEY = "chronoSiege_save";

const DEFAULT = {
  completed:  [],
  bestScores: {},
  totalScore: 0,
  firstRun:   true,
};

export default class SaveManager {
  static load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch {
      return { ...DEFAULT };
    }
  }

  static save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("SaveManager: could not write to localStorage", e);
    }
  }

  static completeLevel(levelId, score) {
    const data = this.load();
    if (!data.completed.includes(levelId)) {
      data.completed.push(levelId);
    }
    if (!data.bestScores[levelId] || score > data.bestScores[levelId]) {
      data.bestScores[levelId] = score;
    }
    data.totalScore = Object.values(data.bestScores).reduce((a, b) => a + b, 0);
    data.firstRun   = false;
    this.save(data);
    return data;
  }

  static isFirstRun() {
    return this.load().firstRun;
  }

  static reset() {
    localStorage.removeItem(KEY);
  }
}