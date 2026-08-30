// ─── Inusaur Run — Constants & Configuration ────────────────────────────────

import type {
  GameConfig,
  MapConfig,
  Difficulty,
  ItemType,
  CosmeticaId,
  Achievement,
  Rank,
  AchievementId,
} from "./types";

// ── Default Game Config ──────────────────────────────────────────────────────

export const DEFAULT_CONFIG: GameConfig = {
  cellSize: 20,
  tickBase: 140,
  tickMin: 50,
  tickFaster: 3,
  dashDuration: 300,
  dashCooldown: 2000,
  dashSpeed: 2.5,
  boostDuration: 1500,
  boostSpeed: 1.8,
  comboTimeout: 3000,
  perfectRunThreshold: 30000,
  bossHpBase: 5,
  bossHpScale: 2,
  eventCooldown: 15000,
  eventDuration: 8000,
  maxItems: 12,
  cameraSmooth: 0.1,
  cameraZoom: 1,
};

// ── Item Definitions ─────────────────────────────────────────────────────────

export const ITEMS: { type: ItemType; emoji: string; points: number; color: string; chance: number }[] = [
  { type: "bulb", emoji: "🌱", points: 1, color: "#4ade80", chance: 40 },
  { type: "bone", emoji: "🦴", points: 2, color: "#f5f5f4", chance: 25 },
  { type: "coin", emoji: "💰", points: 3, color: "#fbbf24", chance: 18 },
  { type: "gem", emoji: "💎", points: 5, color: "#60a5fa", chance: 10 },
  { type: "star", emoji: "⭐", points: 10, color: "#f472b6", chance: 5 },
  { type: "mega", emoji: "🌟", points: 20, color: "#a855f7", chance: 1.5 },
  { type: "shield", emoji: "🛡️", points: 3, color: "#22d3ee", chance: 0.5 },
  { type: "dash", emoji: "⚡", points: 2, color: "#facc15", chance: 0.5 },
];

// ── Difficulty Multipliers ───────────────────────────────────────────────────

export const DIFFICULTY_MULT: Record<Difficulty, number> = {
  easy: 0.6,
  medium: 1.0,
  hard: 1.5,
  extreme: 2.2,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
  extreme: "EXTREME",
};

// ── Evolution Thresholds ─────────────────────────────────────────────────────

export const EVOLUTION_THRESHOLDS = [0, 50, 150, 400, 800, 1500, 3000, 6000, 12000, 25000];

export const EVOLUTION_NAMES = [
  "SEED",
  "SPROUT",
  "BLOOM",
  "ALPHA",
  "ELITE",
  "LEGEND",
  "MYTHIC",
  "GODLIKE",
  "TRANSCENDENT",
  "INUSAUR PRIME",
];

export const EVOLUTION_COLORS = [
  "#4ade80",
  "#22c55e",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#fbbf24",
];

// ── Rank Definitions ─────────────────────────────────────────────────────────

export const RANKS: { rank: Rank; label: string; icon: string; minRating: number; color: string }[] = [
  { rank: "seed", label: "SEED", icon: "🌱", minRating: 0, color: "#4ade80" },
  { rank: "sprout", label: "SPROUT", icon: "🌿", minRating: 500, color: "#22c55e" },
  { rank: "bloom", label: "BLOOM", icon: "🌸", minRating: 1000, color: "#ec4899" },
  { rank: "alpha", label: "ALPHA", icon: "🔥", minRating: 1500, color: "#f59e0b" },
  { rank: "elite", label: "ELITE", icon: "👑", minRating: 2000, color: "#a855f7" },
  { rank: "legend", label: "LEGEND", icon: "💎", minRating: 2500, color: "#fbbf24" },
];

// ── Cosmetics ────────────────────────────────────────────────────────────────

export const COSMETICS: { id: CosmeticaId; name: string; bodyColor: string; flowerColor: string; trailColor: string; auraColor: string }[] = [
  { id: "classic", name: "Classic Inusaur", bodyColor: "#3d8b37", flowerColor: "#f472b6", trailColor: "#4ade80", auraColor: "#22c55e" },
  { id: "fire", name: "Fire Saur", bodyColor: "#dc2626", flowerColor: "#f97316", trailColor: "#ef4444", auraColor: "#fbbf24" },
  { id: "ice", name: "Ice Saur", bodyColor: "#0ea5e9", flowerColor: "#e0f2fe", trailColor: "#38bdf8", auraColor: "#7dd3fc" },
  { id: "cyber", name: "Cyber Saur", bodyColor: "#6366f1", flowerColor: "#a78bfa", trailColor: "#818cf8", auraColor: "#c4b5fd" },
  { id: "ninja", name: "Ninja Saur", bodyColor: "#1e293b", flowerColor: "#f43f5e", trailColor: "#64748b", auraColor: "#f43f5e" },
  { id: "space", name: "Space Saur", bodyColor: "#1e1b4b", flowerColor: "#818cf8", trailColor: "#a78bfa", auraColor: "#c084fc" },
  { id: "king", name: "King Saur", bodyColor: "#fbbf24", flowerColor: "#f472b6", trailColor: "#f59e0b", auraColor: "#fcd34d" },
  { id: "degen", name: "Degen Saur", bodyColor: "#10b981", flowerColor: "#34d399", trailColor: "#6ee7b7", auraColor: "#a7f3d0" },
  { id: "golden", name: "Golden Saur", bodyColor: "#f59e0b", flowerColor: "#fbbf24", trailColor: "#fcd34d", auraColor: "#fde68a" },
  { id: "toxic", name: "Toxic Saur", bodyColor: "#65a30d", flowerColor: "#84cc16", trailColor: "#a3e635", auraColor: "#d9f99d" },
];

// ── Achievement Definitions ──────────────────────────────────────────────────

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_bloom", name: "First Bloom", description: "Collect your first bulb", icon: "🌱", unlocked: false },
  { id: "survive_1m", name: "Survivor", description: "Survive 1 minute", icon: "⏱️", unlocked: false },
  { id: "survive_5m", name: "Veteran", description: "Survive 5 minutes", icon: "🛡️", unlocked: false },
  { id: "survive_10m", name: "Immortal", description: "Survive 10 minutes", icon: "👑", unlocked: false },
  { id: "collect_100_bulbs", name: "Bulb Collector", description: "Collect 100 bulbs", icon: "🌱", unlocked: false },
  { id: "collect_1000_bulbs", name: "Bulb Master", description: "Collect 1,000 bulbs", icon: "🌿", unlocked: false },
  { id: "first_boss", name: "Boss Hunter", description: "Encounter your first boss", icon: "🐉", unlocked: false },
  { id: "boss_survivor", name: "Boss Survivor", description: "Survive a boss encounter", icon: "🏆", unlocked: false },
  { id: "perfect_run", name: "Perfect Run", description: "Survive 30 seconds without damage", icon: "✨", unlocked: false },
  { id: "top_100", name: "Top 100", description: "Reach top 100 on leaderboard", icon: "📊", unlocked: false },
  { id: "top_10", name: "Top 10", description: "Reach top 10 on leaderboard", icon: "🏅", unlocked: false },
  { id: "world_record", name: "World Record", description: "Hold the world record", icon: "🌍", unlocked: false },
  { id: "daily_champion", name: "Daily Champion", description: "Win daily run", icon: "📅", unlocked: false },
  { id: "season_champion", name: "Season Champion", description: "Win a season", icon: "🏆", unlocked: false },
  { id: "combo_10", name: "Combo Starter", description: "Reach 10x combo", icon: "🔥", unlocked: false },
  { id: "combo_25", name: "Combo Master", description: "Reach 25x combo", icon: "💥", unlocked: false },
  { id: "combo_50", name: "Combo Legend", description: "Reach 50x combo", icon: "⚡", unlocked: false },
  { id: "dash_master", name: "Dash Master", description: "Use dash 100 times", icon: "💨", unlocked: false },
  { id: "speed_demon", name: "Speed Demon", description: "Reach max speed", icon: "🚀", unlocked: false },
  { id: "evolution_master", name: "Evolution Master", description: "Reach max evolution", icon: "🧬", unlocked: false },
  { id: "night_survivor", name: "Night Survivor", description: "Survive a nightfall event", icon: "🌑", unlocked: false },
  { id: "eruption_survivor", name: "Eruption Survivor", description: "Survive a volcanic eruption", icon: "🌋", unlocked: false },
  { id: "meteor_dodger", name: "Meteor Dodger", description: "Dodge 10 meteors", icon: "☄️", unlocked: false },
  { id: "bloom_collector", name: "Bloom Collector", description: "Collect 50 flowers in bloom event", icon: "🌸", unlocked: false },
  { id: "legendary_route", name: "Legendary Route", description: "Complete a legendary route", icon: "💎", unlocked: false },
  { id: "danger_route", name: "Danger Route", description: "Complete a danger route", icon: "🔥", unlocked: false },
  { id: "safe_route", name: "Safe Route", description: "Complete a safe route", icon: "🛡️", unlocked: false },
  { id: "all_maps", name: "Map Explorer", description: "Play all maps", icon: "🗺️", unlocked: false },
  { id: "all_difficulties", name: "Difficulty Master", description: "Play all difficulties", icon: "⚙️", unlocked: false },
  { id: "daily_streak_7", name: "Weekly Warrior", description: "7-day daily streak", icon: "🔥", unlocked: false },
  { id: "daily_streak_30", name: "Monthly Master", description: "30-day daily streak", icon: "👑", unlocked: false },
  { id: "first_win", name: "First Win", description: "Win your first game", icon: "🎉", unlocked: false },
  { id: "friend_champion", name: "Friend Champion", description: "Beat a friend's score", icon: "🤝", unlocked: false },
  { id: "season_1", name: "Season 1", description: "Complete Season 1", icon: "🌸", unlocked: false },
  { id: "season_2", name: "Season 2", description: "Complete Season 2", icon: "☠️", unlocked: false },
  { id: "season_3", name: "Season 3", description: "Complete Season 3", icon: "🌙", unlocked: false },
];

// ── Map Definitions ──────────────────────────────────────────────────────────

function makeWalls(
  positions: [number, number, number, number][],
  type: "wall" | "spike" | "moving_wall" | "fire" | "lava" | "ice" = "wall"
): { x: number; y: number; w: number; h: number; type: "wall" | "spike" | "moving_wall" | "fire" | "lava" | "ice"; dx?: number; dy?: number; phase?: number }[] {
  return positions.map(([x, y, w, h]) => ({ x, y, w, h, type }));
}

export const MAPS: MapConfig[] = [
  {
    id: "garden",
    name: "INUSAUR GARDEN",
    subtitle: "Where it all began",
    bgColor: "#0a1f0a",
    gridColor: "#1a3a1a",
    wallColor: "#2d5a2d",
    difficulty: "easy",
    cols: 24,
    rows: 24,
    obstacles: makeWalls([
      [4, 4, 3, 1],
      [17, 4, 3, 1],
      [4, 19, 3, 1],
      [17, 19, 3, 1],
      [11, 11, 2, 2],
    ]),
    safeRoute: [],
    dangerRoute: [],
    legendaryRoute: [],
    spawnRate: 3000,
    maxItems: 8,
    eventChance: 0.005,
    bossChance: 0.001,
  },
  {
    id: "forest",
    name: "DARK FOREST",
    subtitle: "The shadows grow deeper",
    bgColor: "#060f06",
    gridColor: "#0f1f0f",
    wallColor: "#1a3a1a",
    difficulty: "medium",
    cols: 28,
    rows: 28,
    obstacles: makeWalls([
      [3, 3, 2, 4],
      [23, 3, 2, 4],
      [3, 21, 2, 4],
      [23, 21, 2, 4],
      [8, 8, 1, 6],
      [19, 8, 1, 6],
      [8, 14, 1, 6],
      [19, 14, 1, 6],
      [13, 13, 2, 2],
    ]),
    safeRoute: [],
    dangerRoute: [],
    legendaryRoute: [],
    spawnRate: 2500,
    maxItems: 10,
    eventChance: 0.008,
    bossChance: 0.002,
  },
  {
    id: "volcano",
    name: "VOLCANIC CRATER",
    subtitle: "The fire never stops",
    bgColor: "#1a0a00",
    gridColor: "#2a1500",
    wallColor: "#4a2000",
    difficulty: "hard",
    cols: 32,
    rows: 32,
    obstacles: makeWalls([
      [4, 4, 2, 2],
      [26, 4, 2, 2],
      [4, 26, 2, 2],
      [26, 26, 2, 2],
      [10, 10, 1, 12],
      [21, 10, 1, 12],
      [10, 10, 12, 1],
      [10, 21, 12, 1],
      [15, 15, 2, 2],
    ], "fire"),
    safeRoute: [],
    dangerRoute: [],
    legendaryRoute: [],
    spawnRate: 2000,
    maxItems: 12,
    eventChance: 0.012,
    bossChance: 0.004,
  },
  {
    id: "ocean",
    name: "ABYSSAL OCEAN",
    subtitle: "The deep calls",
    bgColor: "#000a1a",
    gridColor: "#001a3a",
    wallColor: "#002a5a",
    difficulty: "hard",
    cols: 30,
    rows: 30,
    obstacles: makeWalls([
      [5, 5, 4, 1],
      [21, 5, 4, 1],
      [5, 24, 4, 1],
      [21, 24, 4, 1],
      [10, 10, 2, 10],
      [18, 10, 2, 10],
      [14, 14, 2, 2],
    ]),
    safeRoute: [],
    dangerRoute: [],
    legendaryRoute: [],
    spawnRate: 2200,
    maxItems: 14,
    eventChance: 0.01,
    bossChance: 0.003,
  },
  {
    id: "void",
    name: "THE VOID",
    subtitle: "Beyond all boundaries",
    bgColor: "#050508",
    gridColor: "#0a0a12",
    wallColor: "#151520",
    difficulty: "extreme",
    cols: 36,
    rows: 36,
    obstacles: makeWalls([
      [3, 3, 2, 2],
      [31, 3, 2, 2],
      [3, 31, 2, 2],
      [31, 31, 2, 2],
      [8, 8, 1, 8],
      [27, 8, 1, 8],
      [8, 20, 1, 8],
      [27, 20, 1, 8],
      [13, 13, 2, 2],
      [21, 13, 2, 2],
      [13, 21, 2, 2],
      [21, 21, 2, 2],
      [17, 17, 2, 2],
    ]),
    safeRoute: [],
    dangerRoute: [],
    legendaryRoute: [],
    spawnRate: 1800,
    maxItems: 16,
    eventChance: 0.015,
    bossChance: 0.005,
  },
];

// ── Season Definitions ───────────────────────────────────────────────────────

export const SEASONS = [
  { id: 1, name: "THE FIRST BLOOM", subtitle: "Where it all begins", theme: "garden", color: "#4ade80" },
  { id: 2, name: "TOXIC EVOLUTION", subtitle: "The mutation spreads", theme: "forest", color: "#65a30d" },
  { id: 3, name: "SAUR AFTER DARK", subtitle: "The night is alive", theme: "volcano", color: "#ef4444" },
  { id: 4, name: "THE GREAT MIGRATION", subtitle: "Across the void", theme: "void", color: "#a855f7" },
];

// ── Daily Run Seed ───────────────────────────────────────────────────────────

export function getDailySeed(): string {
  const d = new Date();
  return `SAUR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export function getWeeklySeed(): string {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `WEEK-${d.getFullYear()}W${String(weekNum).padStart(2, "0")}`;
}

// ── Combo Multipliers ────────────────────────────────────────────────────────

export const COMBO_LEVELS = [
  { min: 0, mult: 1, label: "x1" },
  { min: 5, mult: 2, label: "x2" },
  { min: 15, mult: 3, label: "x3" },
  { min: 30, mult: 5, label: "x5" },
  { min: 50, mult: 10, label: "x10" },
  { min: 100, mult: 20, label: "x20" },
];

export function getComboMultiplier(combo: number): number {
  for (let i = COMBO_LEVELS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_LEVELS[i].min) return COMBO_LEVELS[i].mult;
  }
  return 1;
}

export function getComboLabel(combo: number): string {
  for (let i = COMBO_LEVELS.length - 1; i >= 0; i--) {
    if (combo >= COMBO_LEVELS[i].min) return COMBO_LEVELS[i].label;
  }
  return "x1";
}

// ── XP Required Per Level ────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.5, level));
}

// ── Leaderboard Storage Key ──────────────────────────────────────────────────

export const LB_KEY = "inusaurread_leaderboard";
export const PROFILE_KEY = "inusaurread_profile";
export const ACHIEVEMENTS_KEY = "inusaurread_achievements";
export const DAILY_KEY = "inusaurread_daily";
export const WEEKLY_KEY = "inusaurread_weekly";

// ── World Event Definitions ──────────────────────────────────────────────────

export const EVENT_DEFS = {
  nightfall: { name: "NIGHTFALL", icon: "🌑", description: "The map goes dark. Only the flower provides light." },
  eruption: { name: "ERUPTION", icon: "🌋", description: "The volcano erupts! Lava flows across the map." },
  meteor: { name: "METEOR SHOWER", icon: "☄️", description: "Meteors rain from the sky." },
  bloom: { name: "BLOOM", icon: "🌸", description: "Hundreds of flowers appear. Collect them all!" },
  mutation: { name: "MUTATION", icon: "🧬", description: "Inusaur temporarily changes form." },
  wild_creature: { name: "WILD CREATURE", icon: "🐉", description: "A giant creature enters the map." },
} as const;