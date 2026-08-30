// ─── Inusaur Run — Type Definitions ─────────────────────────────────────────

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export type GameState = "menu" | "countdown" | "playing" | "paused" | "dead";

export type Difficulty = "easy" | "medium" | "hard" | "extreme";

export type MapId = "garden" | "forest" | "volcano" | "ocean" | "void";

export type ItemType =
  | "bulb"
  | "bone"
  | "coin"
  | "gem"
  | "star"
  | "mega"
  | "shield"
  | "dash";

export type EventType =
  | "nightfall"
  | "eruption"
  | "meteor"
  | "bloom"
  | "mutation"
  | "wild_creature";

export type Rank =
  | "seed"
  | "sprout"
  | "bloom"
  | "alpha"
  | "elite"
  | "legend";

export type CosmeticaId =
  | "classic"
  | "fire"
  | "ice"
  | "cyber"
  | "ninja"
  | "space"
  | "king"
  | "degen"
  | "golden"
  | "toxic";

export type AchievementId =
  | "first_bloom"
  | "survive_1m"
  | "survive_5m"
  | "survive_10m"
  | "collect_100_bulbs"
  | "collect_1000_bulbs"
  | "first_boss"
  | "boss_survivor"
  | "perfect_run"
  | "top_100"
  | "top_10"
  | "world_record"
  | "daily_champion"
  | "season_champion"
  | "combo_10"
  | "combo_25"
  | "combo_50"
  | "dash_master"
  | "speed_demon"
  | "evolution_master"
  | "night_survivor"
  | "eruption_survivor"
  | "meteor_dodger"
  | "bloom_collector"
  | "legendary_route"
  | "danger_route"
  | "safe_route"
  | "all_maps"
  | "all_difficulties"
  | "daily_streak_7"
  | "daily_streak_30"
  | "first_win"
  | "friend_champion"
  | "season_1"
  | "season_2"
  | "season_3";

export interface Point {
  x: number;
  y: number;
}

export interface Segment extends Point {
  dir: Direction;
}

export interface Item {
  x: number;
  y: number;
  type: ItemType;
  points: number;
  emoji: string;
  color: string;
  spawnTime: number;
  lifetime: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "wall" | "spike" | "moving_wall" | "fire" | "lava" | "ice";
  dx?: number;
  dy?: number;
  phase?: number;
}

export interface WorldEvent {
  type: EventType;
  startTime: number;
  duration: number;
  active: boolean;
  params: Record<string, number>;
}

export interface Boss {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  dx: number;
  dy: number;
  phase: number;
  active: boolean;
}

export interface MapConfig {
  id: MapId;
  name: string;
  subtitle: string;
  bgColor: string;
  gridColor: string;
  wallColor: string;
  difficulty: Difficulty;
  cols: number;
  rows: number;
  obstacles: Obstacle[];
  safeRoute: Point[];
  dangerRoute: Point[];
  legendaryRoute: Point[];
  spawnRate: number;
  maxItems: number;
  eventChance: number;
  bossChance: number;
}

export interface PlayerState {
  segments: Segment[];
  direction: Direction;
  nextDirection: Direction;
  speed: number;
  score: number;
  xp: number;
  level: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  dashCooldown: number;
  dashTimer: number;
  isDashing: boolean;
  isBraking: boolean;
  isShielded: boolean;
  shieldTimer: number;
  isEvolved: boolean;
  evolutionLevel: number;
  perfectRun: boolean;
  perfectRunTimer: number;
  alive: boolean;
  deathTime: number;
  survivalTime: number;
  bulbsCollected: number;
  itemsCollected: number;
  bossDefeated: number;
  currentMap: MapId;
  currentDifficulty: Difficulty;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  survivalTime: number;
  map: MapId;
  difficulty: Difficulty;
  date: string;
  verified: boolean;
  rank: Rank;
  avatar: CosmeticaId;
}

export interface DailyRun {
  seed: string;
  date: string;
  map: MapId;
  difficulty: Difficulty;
  worldRecord: number;
  worldRecordHolder: string;
  playerBest: number;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  rules: string[];
  startDate: string;
  endDate: string;
  worldRecord: number;
  playerBest: number;
}

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  wallet?: string;
  rank: Rank;
  rating: number;
  bestTime: number;
  bestScore: number;
  seasonRank: number;
  evolutionLevel: number;
  achievements: AchievementId[];
  cosmetics: CosmeticaId[];
  currentCosmetic: CosmeticaId;
  gamesPlayed: number;
  totalScore: number;
  dailyStreak: number;
  lastPlayed: string;
}

export interface GameConfig {
  cellSize: number;
  tickBase: number;
  tickMin: number;
  tickFaster: number;
  dashDuration: number;
  dashCooldown: number;
  dashSpeed: number;
  boostDuration: number;
  boostSpeed: number;
  comboTimeout: number;
  perfectRunThreshold: number;
  bossHpBase: number;
  bossHpScale: number;
  eventCooldown: number;
  eventDuration: number;
  maxItems: number;
  cameraSmooth: number;
  cameraZoom: number;
}

export interface GameStateFull {
  state: GameState;
  player: PlayerState;
  items: Item[];
  obstacles: Obstacle[];
  events: WorldEvent[];
  bosses: Boss[];
  map: MapConfig;
  camera: Point;
  config: GameConfig;
  frameCount: number;
  lastTick: number;
  tickInterval: number;
  countdown: number;
  ghost?: Segment[];
  ghostTimer?: number;
  challengeCode?: string;
  isDailyRun: boolean;
  isWeeklyChallenge: boolean;
  seed: string;
  particles: Particle[];
  screenShake: number;
  flashColor: string;
  flashTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "spark" | "leaf" | "explosion" | "trail" | "text";
  text?: string;
}

export interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  swiping: boolean;
  direction: Direction | null;
}