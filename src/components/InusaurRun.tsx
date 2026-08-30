"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createInitialState,
  tick,
  setDirection,
  dash,
  brake,
  startGame,
  pauseGame,
  restartGame,
  goToMenu,
  selectMap,
  selectDifficulty,
  formatTime,
  formatScore,
  saveLeaderboard,
  loadLeaderboard,
  saveProfile,
  loadProfile,
  saveAchievements,
  loadAchievements,
  getRankFromRating,
  getRankLabel,
  getRankIcon,
  getRankColor,
} from "@/game/engine";
import { render } from "@/game/renderer";
import { setupKeyboardInput, setupTouchInput, createVirtualDPad } from "@/game/input";
import { MAPS, DIFFICULTY_LABELS, EVOLUTION_NAMES, EVOLUTION_COLORS, COSMETICS, ACHIEVEMENTS, SEASONS } from "@/game/constants";
import type { GameStateFull, Direction, MapId, Difficulty, CosmeticaId, AchievementId } from "@/game/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDailySeed(): string {
  const d = new Date();
  return `SAUR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function InusaurRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameStateFull | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const cleanupInputRef = useRef<(() => void) | null>(null);
  const cleanupDPadRef = useRef<(() => void) | null>(null);

  const [screen, setScreen] = useState<"menu" | "playing" | "dead" | "leaderboard" | "profile" | "daily">("menu");
  const [selectedMap, setSelectedMap] = useState<MapId>("garden");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [score, setScore] = useState(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [evolution, setEvolution] = useState(0);
  const [level, setLevel] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ReturnType<typeof loadLeaderboard>>([]);
  const [profile, setProfile] = useState<ReturnType<typeof loadProfile>>(null);
  const [achievements, setAchievements] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [showDPad, setShowDPad] = useState(false);
  const [gameState, setGameState] = useState<GameStateFull | null>(null);

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setLeaderboard(loadLeaderboard());
    setProfile(loadProfile());
    setAchievements(loadAchievements());
  }, []);

  // ── Canvas Setup ──────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Game Loop ─────────────────────────────────────────────────────────────

  const gameLoop = useCallback(
    (time: number) => {
      const state = gameStateRef.current;
      if (!state) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Tick
      if (state.state === "playing" && dt < 100) {
        const now = Date.now();
        if (now - state.lastTick >= state.tickInterval) {
          const newState = tick(state);
          gameStateRef.current = newState;

          // Update React state
          setScore(newState.player.score);
          setSurvivalTime(newState.player.survivalTime);
          setCombo(newState.player.combo);
          setEvolution(newState.player.evolutionLevel);
          setLevel(newState.player.level);

          if (newState.state === "dead") {
            setScreen("dead");
          }
        }
      }

      // Render
      render(ctx, state, canvas.width, canvas.height);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    },
    []
  );

  // ── Start Game ────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    const state = createInitialState(selectedMap, selectedDifficulty, getDailySeed());
    gameStateRef.current = state;
    setGameState(state);
    setScreen("playing");

    // Countdown
    state.state = "countdown";
    state.countdown = 3;

    const countdownInterval = setInterval(() => {
      const s = gameStateRef.current;
      if (!s) return;
      s.countdown--;
      if (s.countdown <= 0) {
        clearInterval(countdownInterval);
        s.state = "playing";
        s.lastTick = Date.now();
      }
    }, 1000);

    // Start game loop
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(gameLoop);

    // Setup input
    const canvas = canvasRef.current;
    if (canvas) {
      const inputCleanup = setupKeyboardInput({
        onDirection: (dir: Direction) => {
          const s = gameStateRef.current;
          if (s) {
            setDirection(s, dir);
          }
        },
        onDash: () => {
          const s = gameStateRef.current;
          if (s) dash(s);
        },
        onBrake: (on: boolean) => {
          const s = gameStateRef.current;
          if (s) brake(s, on);
        },
        onPause: () => {
          const s = gameStateRef.current;
          if (s) {
            pauseGame(s);
            if (s.state === "paused") setScreen("menu");
          }
        },
        onStart: () => {
          const s = gameStateRef.current;
          if (s && s.state === "dead") {
            const newState = restartGame(s);
            gameStateRef.current = newState;
            setGameState(newState);
            setScreen("playing");
          }
        },
      });
      cleanupInputRef.current = inputCleanup;

      // Touch input
      const touchCleanup = setupTouchInput(canvas, {
        onDirection: (dir: Direction) => {
          const s = gameStateRef.current;
          if (s) setDirection(s, dir);
        },
        onDash: () => {
          const s = gameStateRef.current;
          if (s) dash(s);
        },
        onBrake: () => {},
        onPause: () => {
          const s = gameStateRef.current;
          if (s) pauseGame(s);
        },
        onStart: () => {
          const s = gameStateRef.current;
          if (s && s.state === "dead") {
            const newState = restartGame(s);
            gameStateRef.current = newState;
            setGameState(newState);
            setScreen("playing");
          }
        },
      });

      // Virtual D-Pad for mobile
      if (isMobile && containerRef.current) {
        const dpadCleanup = createVirtualDPad(containerRef.current, {
          onDirection: (dir: Direction) => {
            const s = gameStateRef.current;
            if (s) setDirection(s, dir);
          },
          onDash: () => {
            const s = gameStateRef.current;
            if (s) dash(s);
          },
          onBrake: () => {},
          onPause: () => {},
          onStart: () => {},
        });
        cleanupDPadRef.current = dpadCleanup;
      }

      // Cleanup function
      const cleanup = () => {
        inputCleanup();
        touchCleanup();
        if (cleanupDPadRef.current) cleanupDPadRef.current();
        cancelAnimationFrame(animFrameRef.current);
      };

      return cleanup;
    }
  }, [selectedMap, selectedDifficulty, isMobile, gameLoop]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (cleanupInputRef.current) cleanupInputRef.current();
      if (cleanupDPadRef.current) cleanupDPadRef.current();
    };
  }, []);

  // ── Save Score ────────────────────────────────────────────────────────────

  const saveScore = useCallback(() => {
    const state = gameStateRef.current;
    if (!state) return;

    const entry = {
      id: generateId(),
      name: profile?.name || "Player",
      score: state.player.score,
      survivalTime: state.player.survivalTime,
      map: state.player.currentMap,
      difficulty: state.player.currentDifficulty,
      date: new Date().toISOString(),
      verified: false,
      rank: getRankFromRating(state.player.score),
      avatar: profile?.currentCosmetic || "classic",
    };

    const lb = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 100);
    setLeaderboard(lb);
    saveLeaderboard(lb);

    // Update profile
    if (profile) {
      const newProfile = {
        ...profile,
        bestScore: Math.max(profile.bestScore || 0, state.player.score),
        bestTime: Math.max(profile.bestTime || 0, state.player.survivalTime),
        gamesPlayed: (profile.gamesPlayed || 0) + 1,
        totalScore: (profile.totalScore || 0) + state.player.score,
        lastPlayed: new Date().toISOString(),
      };
      setProfile(newProfile);
      saveProfile(newProfile);
    }

    // Check achievements
    const newAchievements = { ...achievements };
    if (state.player.bulbsCollected >= 1) newAchievements["first_bloom"] = true;
    if (state.player.survivalTime >= 60000) newAchievements["survive_1m"] = true;
    if (state.player.survivalTime >= 300000) newAchievements["survive_5m"] = true;
    if (state.player.survivalTime >= 600000) newAchievements["survive_10m"] = true;
    if (state.player.bulbsCollected >= 100) newAchievements["collect_100_bulbs"] = true;
    if (state.player.bulbsCollected >= 1000) newAchievements["collect_1000_bulbs"] = true;
    if (state.player.maxCombo >= 10) newAchievements["combo_10"] = true;
    if (state.player.maxCombo >= 25) newAchievements["combo_25"] = true;
    if (state.player.maxCombo >= 50) newAchievements["combo_50"] = true;
    if (state.player.perfectRun && state.player.perfectRunTimer >= 30000) newAchievements["perfect_run"] = true;
    if (state.player.evolutionLevel >= 9) newAchievements["evolution_master"] = true;
    if (state.player.score > 0) newAchievements["first_win"] = true;
    setAchievements(newAchievements);
    saveAchievements(newAchievements);
  }, [leaderboard, profile, achievements]);

  // ── Render Menu ───────────────────────────────────────────────────────────

  if (screen === "menu") {
    return (
      <div className="relative w-full min-h-screen bg-[#050508] text-white font-mono overflow-hidden">
        {/* Scanlines overlay */}
        <div className="pointer-events-none absolute inset-0 z-50 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter" style={{
              textShadow: "0 0 40px rgba(74, 222, 128, 0.4), 0 0 80px rgba(74, 222, 128, 0.2)",
              color: "#4ade80",
            }}>
              INUSAUR
            </h1>
            <div className="text-xl md:text-2xl tracking-[0.3em] mt-2" style={{ color: "#f472b6" }}>
              RUN
            </div>
            <div className="text-sm mt-4 tracking-widest" style={{ color: "#666" }}>
              EVOLUTION STATUS: EVOLUTION IN PROGRESS
            </div>
          </div>

          {/* Map Selection */}
          <div className="w-full max-w-lg mb-6">
            <div className="text-xs tracking-widest mb-3" style={{ color: "#4ade80" }}>
              SELECT MAP
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {MAPS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMap(m.id)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedMap === m.id
                      ? "border-[#4ade80] bg-[#4ade80]/10"
                      : "border-[#222] bg-[#0a0a0f] hover:border-[#333]"
                  }`}
                >
                  <div className="text-sm font-bold" style={{ color: selectedMap === m.id ? "#4ade80" : "#aaa" }}>
                    {m.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#555" }}>
                    {m.subtitle}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#444" }}>
                    {m.cols}x{m.rows} • {m.difficulty.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="w-full max-w-lg mb-8">
            <div className="text-xs tracking-widest mb-3" style={{ color: "#f472b6" }}>
              DIFFICULTY
            </div>
            <div className="flex gap-2">
              {(["easy", "medium", "hard", "extreme"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-bold transition-all ${
                    selectedDifficulty === d
                      ? "border-[#f472b6] bg-[#f472b6]/10 text-[#f472b6]"
                      : "border-[#222] bg-[#0a0a0f] text-[#666] hover:border-[#333]"
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full max-w-lg py-4 rounded-xl font-bold text-xl tracking-widest transition-all"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff",
              boxShadow: "0 0 30px rgba(74, 222, 128, 0.3)",
            }}
          >
            ▶ START EVOLUTION
          </button>

          {/* Quick Actions */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setScreen("leaderboard")}
              className="px-4 py-2 rounded-lg border border-[#333] text-sm hover:border-[#4ade80] transition-all"
              style={{ color: "#888" }}
            >
              📊 LEADERBOARD
            </button>
            <button
              onClick={() => setScreen("profile")}
              className="px-4 py-2 rounded-lg border border-[#333] text-sm hover:border-[#4ade80] transition-all"
              style={{ color: "#888" }}
            >
              👤 PROFILE
            </button>
          </div>

          {/* Controls hint */}
          <div className="mt-8 text-xs" style={{ color: "#444" }}>
            {isMobile ? "Swipe to move • Double-tap to dash" : "WASD/Arrows to move • Shift to dash • Space to pause"}
          </div>
        </div>
      </div>
    );
  }

  // ── Render Game ───────────────────────────────────────────────────────────

  if (screen === "playing") {
    const state = gameStateRef.current;
    const isCountdown = state?.state === "countdown";
    const isPaused = state?.state === "paused";

    return (
      <div ref={containerRef} className="relative w-full h-screen bg-[#050508] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: "none" }}
        />

        {/* Countdown overlay */}
        {isCountdown && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="text-8xl font-bold animate-pulse" style={{ color: "#4ade80" }}>
                {state?.countdown || 3}
              </div>
              <div className="text-xl mt-4 tracking-widest" style={{ color: "#666" }}>
                INITIALIZING...
              </div>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="text-4xl font-bold mb-4" style={{ color: "#4ade80" }}>
                EVOLUTION PAUSED
              </div>
              <div className="text-sm tracking-widest mb-6" style={{ color: "#666" }}>
                PRESS SPACE TO RESUME
              </div>
              <button
                onClick={() => {
                  const s = gameStateRef.current;
                  if (s) {
                    pauseGame(s);
                    setScreen("menu");
                  }
                }}
                className="px-6 py-3 rounded-lg border border-[#333] text-sm hover:border-[#4ade80] transition-all"
                style={{ color: "#888" }}
              >
                ← BACK TO MENU
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Render Game Over ──────────────────────────────────────────────────────

  if (screen === "dead") {
    const state = gameStateRef.current;
    const player = state?.player;

    return (
      <div className="relative w-full min-h-screen bg-[#050508] text-white font-mono overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-50 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }} />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Death Screen */}
          <div className="text-center mb-8">
            <div className="text-sm tracking-widest mb-4" style={{ color: "#ef4444" }}>
              EVOLUTION TERMINATED
            </div>
            <div className="text-6xl md:text-8xl font-bold" style={{
              textShadow: "0 0 40px rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
            }}>
              {player ? formatScore(player.score) : "0"}
            </div>
            <div className="text-sm mt-2 tracking-widest" style={{ color: "#666" }}>
              SCORE
            </div>
          </div>

          {/* Stats */}
          <div className="w-full max-w-sm space-y-3 mb-8">
            {[
              { label: "SURVIVAL TIME", value: player ? formatTime(player.survivalTime) : "00:00.00" },
              { label: "MAX COMBO", value: `x${player?.maxCombo || 0}` },
              { label: "EVOLUTION", value: EVOLUTION_NAMES[player?.evolutionLevel || 0] || "SEED" },
              { label: "BULBS", value: String(player?.bulbsCollected || 0) },
              { label: "ITEMS", value: String(player?.itemsCollected || 0) },
            ].map((stat) => (
              <div key={stat.label} className="flex justify-between items-center py-2 px-4 rounded-lg border border-[#222] bg-[#0a0a0f]">
                <span className="text-xs tracking-widest" style={{ color: "#666" }}>
                  {stat.label}
                </span>
                <span className="text-sm font-bold" style={{ color: "#4ade80" }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => {
                if (state) {
                  const newState = restartGame(state);
                  gameStateRef.current = newState;
                  setGameState(newState);
                  setScreen("playing");
                }
              }}
              className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest transition-all"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                boxShadow: "0 0 20px rgba(74, 222, 128, 0.3)",
              }}
            >
              ▶ TRY AGAIN
            </button>
            <button
              onClick={() => {
                saveScore();
                setScreen("menu");
              }}
              className="flex-1 py-3 rounded-xl font-bold text-sm tracking-widest transition-all border border-[#333]"
              style={{ color: "#888" }}
            >
              ← MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Leaderboard ────────────────────────────────────────────────────

  if (screen === "leaderboard") {
    return (
      <div className="relative w-full min-h-screen bg-[#050508] text-white font-mono overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-50 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="text-sm tracking-widest mb-2" style={{ color: "#4ade80" }}>
              GLOBAL RANKING
            </div>
            <h1 className="text-4xl font-bold" style={{ color: "#4ade80" }}>
              LEADERBOARD
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["GLOBAL", "DAILY", "WEEKLY", "MONTHLY"].map((tab) => (
              <button
                key={tab}
                className="px-4 py-2 rounded-lg border text-xs tracking-widest transition-all border-[#222] bg-[#0a0a0f] text-[#666] hover:border-[#4ade80]"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Entries */}
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: "#444" }}>
                NO RUNS YET. BE THE FIRST.
              </div>
            ) : (
              leaderboard.slice(0, 20).map((entry: { id: string; name: string; score: number; survivalTime: number; map: string; difficulty: string; date: string; verified: boolean; rank: string; avatar: string }, i: number) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 py-3 px-4 rounded-lg border border-[#222] bg-[#0a0a0f]"
                >
                  <div className="text-lg font-bold" style={{ color: i < 3 ? "#fbbf24" : "#666" }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: "#fff" }}>
                      {entry.name}
                    </div>
                    <div className="text-xs" style={{ color: "#555" }}>
                      {entry.map} • {entry.difficulty} • {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: "#4ade80" }}>
                      {formatScore(entry.score)}
                    </div>
                    <div className="text-xs" style={{ color: "#555" }}>
                      {formatTime(entry.survivalTime)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setScreen("menu")}
            className="mt-8 w-full py-3 rounded-xl font-bold text-sm tracking-widest border border-[#333]"
            style={{ color: "#888" }}
          >
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // ── Render Profile ────────────────────────────────────────────────────────

  if (screen === "profile") {
    const rank = profile ? getRankFromRating(profile.rating || 0) : "seed";
    const rankLabel = getRankLabel(rank);
    const rankIcon = getRankIcon(rank);
    const rankColor = getRankColor(rank);

    return (
      <div className="relative w-full min-h-screen bg-[#050508] text-white font-mono overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-50 opacity-5" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="text-sm tracking-widest mb-2" style={{ color: "#4ade80" }}>
              INUSAUR TRAINER
            </div>
            <h1 className="text-4xl font-bold" style={{ color: "#4ade80" }}>
              {profile?.name || "PLAYER"}
            </h1>
          </div>

          {/* Profile Card */}
          <div className="p-6 rounded-xl border border-[#222] bg-[#0a0a0f] mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{
                background: `${rankColor}20`,
                border: `2px solid ${rankColor}`,
              }}>
                {rankIcon}
              </div>
              <div>
                <div className="text-sm tracking-widest" style={{ color: rankColor }}>
                  {rankLabel}
                </div>
                <div className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {profile?.rating || 0}
                </div>
                <div className="text-xs" style={{ color: "#666" }}>
                  SAUR RATING
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "BEST TIME", value: profile?.bestTime ? formatTime(profile.bestTime) : "N/A" },
                { label: "BEST SCORE", value: profile?.bestScore ? formatScore(profile.bestScore) : "N/A" },
                { label: "GAMES PLAYED", value: String(profile?.gamesPlayed || 0) },
                { label: "TOTAL SCORE", value: profile?.totalScore ? formatScore(profile.totalScore) : "0" },
                { label: "SEASON RANK", value: `#${profile?.seasonRank || "N/A"}` },
                { label: "EVOLUTION", value: EVOLUTION_NAMES[profile?.evolutionLevel || 0] || "SEED" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-lg border border-[#222] bg-[#050508]">
                  <div className="text-xs tracking-widest mb-1" style={{ color: "#666" }}>
                    {stat.label}
                  </div>
                  <div className="text-sm font-bold" style={{ color: "#4ade80" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-6">
            <div className="text-xs tracking-widest mb-3" style={{ color: "#f472b6" }}>
              ACHIEVEMENTS
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ACHIEVEMENTS.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg border transition-all ${
                    achievements[a.id]
                      ? "border-[#4ade80] bg-[#4ade80]/10"
                      : "border-[#222] bg-[#0a0a0f] opacity-50"
                  }`}
                >
                  <div className="text-lg mb-1">{a.icon}</div>
                  <div className="text-xs font-bold" style={{ color: achievements[a.id] ? "#4ade80" : "#555" }}>
                    {a.name}
                  </div>
                  <div className="text-xs" style={{ color: "#444" }}>
                    {a.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setScreen("menu")}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-widest border border-[#333]"
            style={{ color: "#888" }}
          >
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // ── Default ───────────────────────────────────────────────────────────────

  return null;
}