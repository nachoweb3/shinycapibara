// ─── Inusaur Run — Game Engine ──────────────────────────────────────────────

import type {
  GameStateFull,
  Direction,
  Point,
  Segment,
  Item,
  Obstacle,
  WorldEvent,
  Boss,
  Particle,
  PlayerState,
  MapConfig,
  GameConfig,
  EventType,
  ItemType,
  Difficulty,
  MapId,
} from "./types";

import {
  DEFAULT_CONFIG,
  ITEMS,
  DIFFICULTY_MULT,
  EVOLUTION_THRESHOLDS,
  EVOLUTION_NAMES,
  EVOLUTION_COLORS,
  COMBO_LEVELS,
  getComboMultiplier,
  getComboLabel,
  xpForLevel,
  MAPS,
  EVENT_DEFS,
} from "./constants";

// ── Seeded Random ────────────────────────────────────────────────────────────

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  let s = h >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

// ── Initial State ────────────────────────────────────────────────────────────

export function createInitialState(mapId: MapId, difficulty: Difficulty, seed: string): GameStateFull {
  const map = MAPS.find((m) => m.id === mapId) || MAPS[0];
  const config = { ...DEFAULT_CONFIG };
  const mult = DIFFICULTY_MULT[difficulty];

  const startX = Math.floor(map.cols / 2);
  const startY = Math.floor(map.rows / 2);

  const player: PlayerState = {
    segments: [{ x: startX, y: startY, dir: "RIGHT" }],
    direction: "RIGHT",
    nextDirection: "RIGHT",
    speed: config.tickBase * mult,
    score: 0,
    xp: 0,
    level: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    dashCooldown: 0,
    dashTimer: 0,
    isDashing: false,
    isBraking: false,
    isShielded: false,
    shieldTimer: 0,
    isEvolved: false,
    evolutionLevel: 0,
    perfectRun: true,
    perfectRunTimer: 0,
    alive: true,
    deathTime: 0,
    survivalTime: 0,
    bulbsCollected: 0,
    itemsCollected: 0,
    bossDefeated: 0,
    currentMap: mapId,
    currentDifficulty: difficulty,
  };

  return {
    state: "menu",
    player,
    items: [],
    obstacles: [...map.obstacles],
    events: [],
    bosses: [],
    map,
    camera: { x: startX * config.cellSize, y: startY * config.cellSize },
    config,
    frameCount: 0,
    lastTick: 0,
    tickInterval: config.tickBase * mult,
    countdown: 3,
    isDailyRun: false,
    isWeeklyChallenge: false,
    seed,
    particles: [],
    screenShake: 0,
    flashColor: "",
    flashTimer: 0,
  };
}

// ── Direction Helpers ────────────────────────────────────────────────────────

const DIR_OFFSETS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

function isValidDirection(current: Direction, next: Direction): boolean {
  return OPPOSITE[current] !== next;
}

// ── Collision Detection ──────────────────────────────────────────────────────

function isCollidingWithWalls(pos: Point, map: MapConfig, obstacles: Obstacle[]): boolean {
  if (pos.x < 0 || pos.x >= map.cols || pos.y < 0 || pos.y >= map.rows) return true;

  for (const obs of obstacles) {
    if (pos.x >= obs.x && pos.x < obs.x + obs.w && pos.y >= obs.y && pos.y < obs.y + obs.h) {
      return true;
    }
  }
  return false;
}

function isCollidingWithSelf(segments: Segment[], pos: Point): boolean {
  return segments.some((s) => s.x === pos.x && s.y === pos.y);
}

function isCollidingWithBoss(pos: Point, bosses: Boss[]): boolean {
  for (const boss of bosses) {
    if (boss.active && pos.x >= boss.x && pos.x < boss.x + boss.w && pos.y >= boss.y && pos.y < boss.y + boss.h) {
      return true;
    }
  }
  return false;
}

function isCollidingWithItems(pos: Point, items: Item[]): Item | null {
  return items.find((i) => i.x === pos.x && i.y === pos.y) || null;
}

// ── Item Spawning ────────────────────────────────────────────────────────────

function spawnItem(state: GameStateFull): Item | null {
  const map = state.map;
  const config = state.config;
  const rand = seededRandom(state.seed + state.frameCount);

  for (let attempt = 0; attempt < 50; attempt++) {
    const x = Math.floor(rand() * map.cols);
    const y = Math.floor(rand() * map.rows);

    if (isCollidingWithWalls({ x, y }, map, state.obstacles)) continue;
    if (isCollidingWithSelf(state.player.segments, { x, y })) continue;
    if (state.items.some((i) => i.x === x && i.y === y)) continue;

    // Pick item type based on chances
    const roll = rand() * 100;
    let cumulative = 0;
    let chosen = ITEMS[0];
    for (const item of ITEMS) {
      cumulative += item.chance;
      if (roll < cumulative) {
        chosen = item;
        break;
      }
    }

    return {
      x,
      y,
      type: chosen.type,
      points: chosen.points,
      emoji: chosen.emoji,
      color: chosen.color,
      spawnTime: Date.now(),
      lifetime: 10000 + rand() * 15000,
    };
  }
  return null;
}

// ── Event Spawning ───────────────────────────────────────────────────────────

function spawnEvent(state: GameStateFull): WorldEvent | null {
  const eventTypes: EventType[] = ["nightfall", "eruption", "meteor", "bloom", "mutation", "wild_creature"];
  const rand = seededRandom(state.seed + state.frameCount + 999);
  const type = eventTypes[Math.floor(rand() * eventTypes.length)];
  const def = EVENT_DEFS[type];

  return {
    type,
    startTime: Date.now(),
    duration: 8000,
    active: true,
    params: {
      intensity: 0.5 + rand() * 0.5,
      speed: 0.8 + rand() * 0.4,
    },
  };
}

// ── Boss Spawning ────────────────────────────────────────────────────────────

function spawnBoss(state: GameStateFull): Boss | null {
  const map = state.map;
  const config = state.config;
  const rand = seededRandom(state.seed + state.frameCount + 777);
  const hp = config.bossHpBase + Math.floor(state.player.score / 100) * config.bossHpScale;

  const x = Math.floor(rand() * (map.cols - 4));
  const y = Math.floor(rand() * (map.rows - 4));

  return {
    x,
    y,
    w: 4,
    h: 4,
    hp,
    maxHp: hp,
    dx: rand() > 0.5 ? 1 : -1,
    dy: rand() > 0.5 ? 1 : -1,
    phase: 0,
    active: true,
  };
}

// ── Particle Spawning ────────────────────────────────────────────────────────

function spawnParticles(state: GameStateFull, x: number, y: number, color: string, count: number, type: Particle["type"] = "spark") {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 1 + Math.random() * 2;
    state.particles.push({
      x: x * state.config.cellSize,
      y: y * state.config.cellSize,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 30 + Math.random() * 20,
      color,
      size: 2 + Math.random() * 3,
      type,
    });
  }
}

function spawnTextParticle(state: GameStateFull, x: number, y: number, text: string, color: string) {
  state.particles.push({
    x: x * state.config.cellSize,
    y: y * state.config.cellSize,
    vx: 0,
    vy: -1.5,
    life: 60,
    maxLife: 60,
    color,
    size: 14,
    type: "text",
    text,
  });
}

// ── Game Tick ────────────────────────────────────────────────────────────────

export function tick(state: GameStateFull): GameStateFull {
  if (state.state !== "playing") return state;

  const now = Date.now();
  const player = state.player;
  const config = state.config;
  const map = state.map;

  // Update survival time
  player.survivalTime = now - (state.lastTick > 0 ? state.lastTick : now);

  // Update combo timer
  if (player.comboTimer > 0) {
    player.comboTimer -= state.tickInterval;
    if (player.comboTimer <= 0) {
      player.combo = 0;
      player.comboTimer = 0;
    }
  }

  // Update dash
  if (player.isDashing) {
    player.dashTimer -= state.tickInterval;
    if (player.dashTimer <= 0) {
      player.isDashing = false;
      player.dashTimer = 0;
    }
  }
  if (player.dashCooldown > 0) {
    player.dashCooldown -= state.tickInterval;
    if (player.dashCooldown < 0) player.dashCooldown = 0;
  }

  // Update shield
  if (player.isShielded) {
    player.shieldTimer -= state.tickInterval;
    if (player.shieldTimer <= 0) {
      player.isShielded = false;
      player.shieldTimer = 0;
    }
  }

  // Update perfect run timer
  if (player.perfectRun) {
    player.perfectRunTimer += state.tickInterval;
  }

  // Update events
  for (const evt of state.events) {
    if (evt.active && now - evt.startTime > evt.duration) {
      evt.active = false;
    }
  }
  state.events = state.events.filter((e) => e.active);

  // Update bosses
  for (const boss of state.bosses) {
    if (!boss.active) continue;
    boss.x += boss.dx;
    boss.y += boss.dy;
    boss.phase += 0.1;

    // Bounce off walls
    if (boss.x <= 0 || boss.x >= map.cols - boss.w) boss.dx = -boss.dx;
    if (boss.y <= 0 || boss.y >= map.rows - boss.h) boss.dy = -boss.dy;

    // Keep in bounds
    boss.x = Math.max(0, Math.min(map.cols - boss.w, boss.x));
    boss.y = Math.max(0, Math.min(map.rows - boss.h, boss.y));
  }
  state.bosses = state.bosses.filter((b) => b.active);

  // Update items (lifetime)
  state.items = state.items.filter((item) => now - item.spawnTime < item.lifetime);

  // Update particles
  state.particles = state.particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    return p.life > 0;
  });

  // Update screen shake
  if (state.screenShake > 0) state.screenShake -= 0.5;
  if (state.flashTimer > 0) state.flashTimer--;

  // ── Move Player ──────────────────────────────────────────────────────────

  // Apply direction
  if (isValidDirection(player.direction, player.nextDirection)) {
    player.direction = player.nextDirection;
  }

  const offset = DIR_OFFSETS[player.direction];
  const speedMult = player.isDashing ? config.dashSpeed : player.isBraking ? 0.5 : 1;
  const head = player.segments[0];
  const newX = head.x + Math.round(offset.x * speedMult);
  const newY = head.y + Math.round(offset.y * speedMult);

  // Check wall collision
  if (isCollidingWithWalls({ x: newX, y: newY }, map, state.obstacles)) {
    if (player.isShielded) {
      player.isShielded = false;
      player.shieldTimer = 0;
      state.screenShake = 5;
      spawnParticles(state, newX, newY, "#22d3ee", 8, "explosion");
    } else {
      player.alive = false;
      player.deathTime = now;
      state.state = "dead";
      state.screenShake = 10;
      state.flashColor = "#ef4444";
      state.flashTimer = 10;
      spawnParticles(state, newX, newY, "#ef4444", 15, "explosion");
      return state;
    }
  }

  // Check self collision
  if (isCollidingWithSelf(player.segments, { x: newX, y: newY })) {
    if (player.isShielded) {
      player.isShielded = false;
      player.shieldTimer = 0;
      state.screenShake = 5;
      spawnParticles(state, newX, newY, "#22d3ee", 8, "explosion");
    } else {
      player.alive = false;
      player.deathTime = now;
      state.state = "dead";
      state.screenShake = 10;
      state.flashColor = "#ef4444";
      state.flashTimer = 10;
      spawnParticles(state, newX, newY, "#ef4444", 15, "explosion");
      return state;
    }
  }

  // Check boss collision
  if (isCollidingWithBoss({ x: newX, y: newY }, state.bosses)) {
    if (player.isShielded) {
      player.isShielded = false;
      player.shieldTimer = 0;
    } else {
      player.alive = false;
      player.deathTime = now;
      state.state = "dead";
      state.screenShake = 10;
      state.flashColor = "#ef4444";
      state.flashTimer = 10;
      spawnParticles(state, newX, newY, "#ef4444", 15, "explosion");
      return state;
    }
  }

  // Move
  const newHead: Segment = { x: newX, y: newY, dir: player.direction };
  player.segments.unshift(newHead);

  // Check item collision
  const hitItem = isCollidingWithItems({ x: newX, y: newY }, state.items);
  if (hitItem) {
    // Remove item
    state.items = state.items.filter((i) => i !== hitItem);

    // Combo
    player.combo++;
    player.comboTimer = config.comboTimeout;
    if (player.combo > player.maxCombo) player.maxCombo = player.combo;

    const comboMult = getComboMultiplier(player.combo);
    const points = hitItem.points * comboMult;
    player.score += points;
    player.xp += points;
    player.itemsCollected++;
    if (hitItem.type === "bulb") player.bulbsCollected++;

    // Special items
    if (hitItem.type === "shield") {
      player.isShielded = true;
      player.shieldTimer = 5000;
    }
    if (hitItem.type === "dash") {
      player.dashCooldown = 0;
    }

    // Particles
    spawnParticles(state, newX, newY, hitItem.color, 6, "spark");
    spawnTextParticle(state, newX, newY, `+${points}`, hitItem.color);

    // Don't remove tail (grow)
  } else {
    // Remove tail (don't grow)
    player.segments.pop();
  }

  // Check evolution
  const newLevel = EVOLUTION_THRESHOLDS.findIndex((t) => player.xp < t) - 1;
  if (newLevel > player.level) {
    player.level = newLevel;
    player.isEvolved = true;
    player.evolutionLevel = newLevel;
    state.flashColor = EVOLUTION_COLORS[newLevel] || "#4ade80";
    state.flashTimer = 15;
    spawnParticles(state, newX, newY, EVOLUTION_COLORS[newLevel] || "#4ade80", 12, "spark");
    spawnTextParticle(state, newX, newY, EVOLUTION_NAMES[newLevel] || "EVOLVED", EVOLUTION_COLORS[newLevel] || "#4ade80");
  }

  // Check level up
  if (player.xp >= xpForLevel(player.level + 1)) {
    player.level++;
    player.speed = Math.max(config.tickMin, player.speed - config.tickFaster);
    state.tickInterval = player.speed;
  }

  // Update camera
  const targetX = newX * config.cellSize;
  const targetY = newY * config.cellSize;
  state.camera.x += (targetX - state.camera.x) * config.cameraSmooth;
  state.camera.y += (targetY - state.camera.y) * config.cameraSmooth;

  // Update frame count
  state.frameCount++;
  state.lastTick = now;

  // Spawn items
  if (state.items.length < map.maxItems && state.frameCount % Math.floor(map.spawnRate / state.tickInterval) === 0) {
    const newItem = spawnItem(state);
    if (newItem) state.items.push(newItem);
  }

  // Spawn events
  if (state.frameCount > 100 && Math.random() < map.eventChance && state.events.length === 0) {
    const newEvent = spawnEvent(state);
    if (newEvent) state.events.push(newEvent);
  }

  // Spawn bosses
  if (state.bosses.length === 0 && Math.random() < map.bossChance && player.score > 50) {
    const newBoss = spawnBoss(state);
    if (newBoss) {
      state.bosses.push(newBoss);
      state.screenShake = 8;
      state.flashColor = "#a855f7";
      state.flashTimer = 10;
      spawnTextParticle(state, newX, newY, "BOSS!", "#a855f7");
    }
  }

  return state;
}

// ── Input Handling ───────────────────────────────────────────────────────────

export function setDirection(state: GameStateFull, dir: Direction): GameStateFull {
  if (state.state !== "playing") return state;
  if (isValidDirection(state.player.direction, dir)) {
    state.player.nextDirection = dir;
  }
  return state;
}

export function dash(state: GameStateFull): GameStateFull {
  if (state.state !== "playing") return state;
  if (state.player.dashCooldown <= 0 && !state.player.isDashing) {
    state.player.isDashing = true;
    state.player.dashTimer = state.config.dashDuration;
    state.player.dashCooldown = state.config.dashCooldown;
    spawnParticles(state, state.player.segments[0].x, state.player.segments[0].y, "#facc15", 8, "trail");
  }
  return state;
}

export function brake(state: GameStateFull, on: boolean): GameStateFull {
  if (state.state !== "playing") return state;
  state.player.isBraking = on;
  return state;
}

// ── Game Control ─────────────────────────────────────────────────────────────

export function startGame(state: GameStateFull): GameStateFull {
  state.state = "countdown";
  state.countdown = 3;
  return state;
}

export function pauseGame(state: GameStateFull): GameStateFull {
  if (state.state === "playing") {
    state.state = "paused";
  } else if (state.state === "paused") {
    state.state = "playing";
  }
  return state;
}

export function restartGame(state: GameStateFull): GameStateFull {
  const newState = createInitialState(
    state.player.currentMap,
    state.player.currentDifficulty,
    state.seed
  );
  newState.state = "countdown";
  newState.countdown = 3;
  return newState;
}

export function goToMenu(state: GameStateFull): GameStateFull {
  return createInitialState(
    state.player.currentMap,
    state.player.currentDifficulty,
    state.seed
  );
}

export function selectMap(state: GameStateFull, mapId: MapId): GameStateFull {
  state.player.currentMap = mapId;
  return state;
}

export function selectDifficulty(state: GameStateFull, diff: Difficulty): GameStateFull {
  state.player.currentDifficulty = diff;
  return state;
}

// ── Score Formatting ─────────────────────────────────────────────────────────

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

export function saveLeaderboard(entries: { id: string; name: string; score: number; survivalTime: number; map: MapId; difficulty: Difficulty; date: string; verified: boolean; rank: string; avatar: string }[]) {
  try {
    localStorage.setItem("inusaurread_leaderboard", JSON.stringify(entries));
  } catch {}
}

export function loadLeaderboard() {
  try {
    const data = localStorage.getItem("inusaurread_leaderboard");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDailyRun(run: { seed: string; date: string; map: MapId; difficulty: Difficulty; worldRecord: number; worldRecordHolder: string; playerBest: number }) {
  try {
    localStorage.setItem("inusaurread_daily", JSON.stringify(run));
  } catch {}
}

export function loadDailyRun() {
  try {
    const data = localStorage.getItem("inusaurread_daily");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Record<string, unknown>) {
  try {
    localStorage.setItem("inusaurread_profile", JSON.stringify(profile));
  } catch {}
}

export function loadProfile() {
  try {
    const data = localStorage.getItem("inusaurread_profile");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveAchievements(achievements: Record<string, boolean>) {
  try {
    localStorage.setItem("inusaurread_achievements", JSON.stringify(achievements));
  } catch {}
}

export function loadAchievements() {
  try {
    const data = localStorage.getItem("inusaurread_achievements");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// ── Get Rank from Rating ─────────────────────────────────────────────────────

export function getRankFromRating(rating: number): string {
  if (rating >= 2500) return "legend";
  if (rating >= 2000) return "elite";
  if (rating >= 1500) return "alpha";
  if (rating >= 1000) return "bloom";
  if (rating >= 500) return "sprout";
  return "seed";
}

// ── Get Rank Label ───────────────────────────────────────────────────────────

export function getRankLabel(rank: string): string {
  const labels: Record<string, string> = {
    seed: "SEED",
    sprout: "SPROUT",
    bloom: "BLOOM",
    alpha: "ALPHA",
    elite: "ELITE",
    legend: "LEGEND",
  };
  return labels[rank] || "SEED";
}

// ── Get Rank Icon ────────────────────────────────────────────────────────────

export function getRankIcon(rank: string): string {
  const icons: Record<string, string> = {
    seed: "🌱",
    sprout: "🌿",
    bloom: "🌸",
    alpha: "🔥",
    elite: "👑",
    legend: "💎",
  };
  return icons[rank] || "🌱";
}

// ── Get Rank Color ───────────────────────────────────────────────────────────

export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    seed: "#4ade80",
    sprout: "#22c55e",
    bloom: "#ec4899",
    alpha: "#f59e0b",
    elite: "#a855f7",
    legend: "#fbbf24",
  };
  return colors[rank] || "#4ade80";
}