// ─── Inusaur Run — Canvas Renderer ──────────────────────────────────────────

import type { GameStateFull, Segment, Item, Obstacle, Boss, Particle, MapConfig } from "./types";
import { EVOLUTION_COLORS, EVOLUTION_NAMES, COSMETICS } from "./constants";

// ── Draw Helpers ─────────────────────────────────────────────────────────────

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInusaurHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, evolution: number, isDashing: boolean, isShielded: boolean, flowerColor: string) {
  const s = size * 0.45;

  // Body
  ctx.beginPath();
  ctx.arc(cx, cy, s, 0, Math.PI * 2);
  ctx.fillStyle = EVOLUTION_COLORS[evolution] || "#3d8b37";
  ctx.fill();
  ctx.strokeStyle = "#1a3a1a";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eyes
  const eyeOffset = s * 0.35;
  const eyeSize = s * 0.2;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx - eyeOffset, cy - s * 0.15, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeOffset, cy - s * 0.15, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  const pupilSize = eyeSize * 0.55;
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(cx - eyeOffset, cy - s * 0.15, pupilSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeOffset, cy - s * 0.15, pupilSize, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx - eyeOffset + 1, cy - s * 0.2, pupilSize * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeOffset + 1, cy - s * 0.2, pupilSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.15, s * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy + s * 0.2, s * 0.15, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Ears
  ctx.fillStyle = EVOLUTION_COLORS[evolution] || "#3d8b37";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.7, cy - s * 0.5);
  ctx.lineTo(cx - s * 0.4, cy - s * 1.2);
  ctx.lineTo(cx - s * 0.1, cy - s * 0.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.7, cy - s * 0.5);
  ctx.lineTo(cx + s * 0.4, cy - s * 1.2);
  ctx.lineTo(cx + s * 0.1, cy - s * 0.5);
  ctx.fill();

  // Flower on back
  const flowerSize = s * 0.35;
  const flowerY = cy - s * 0.9;
  ctx.fillStyle = flowerColor;
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * flowerSize;
    const py = flowerY + Math.sin(angle) * flowerSize;
    ctx.beginPath();
    ctx.arc(px, py, flowerSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(cx, flowerY, flowerSize * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Dash effect
  if (isDashing) {
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, s + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Shield effect
  if (isShielded) {
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, s + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ── Main Render ──────────────────────────────────────────────────────────────

export function render(ctx: CanvasRenderingContext2D, state: GameStateFull, width: number, height: number) {
  const config = state.config;
  const map = state.map;
  const player = state.player;
  const cell = config.cellSize;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = map.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Camera transform
  const camX = width / 2 - state.camera.x;
  const camY = height / 2 - state.camera.y;

  ctx.save();
  ctx.translate(camX, camY);

  // Screen shake
  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
    ctx.translate(shakeX, shakeY);
  }

  // Grid
  ctx.strokeStyle = map.gridColor;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= map.cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cell, 0);
    ctx.lineTo(x * cell, map.rows * cell);
    ctx.stroke();
  }
  for (let y = 0; y <= map.rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cell);
    ctx.lineTo(map.cols * cell, y * cell);
    ctx.stroke();
  }

  // Obstacles
  for (const obs of state.obstacles) {
    ctx.fillStyle = map.wallColor;
    drawRoundRect(ctx, obs.x * cell, obs.y * cell, obs.w * cell, obs.h * cell, 2);
    ctx.fill();

    // Obstacle border
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fire effect
    if (obs.type === "fire") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      drawRoundRect(ctx, obs.x * cell - 1, obs.y * cell - 1, obs.w * cell + 2, obs.h * cell + 2, 3);
      ctx.fill();
    }
  }

  // Items
  for (const item of state.items) {
    const alpha = Math.max(0, 1 - (Date.now() - item.spawnTime) / item.lifetime);
    ctx.globalAlpha = alpha;
    ctx.font = `${cell * 0.8}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.emoji, item.x * cell + cell / 2, item.y * cell + cell / 2);
    ctx.globalAlpha = 1;
  }

  // Bosses
  for (const boss of state.bosses) {
    if (!boss.active) continue;
    const bx = boss.x * cell;
    const by = boss.y * cell;
    const bw = boss.w * cell;
    const bh = boss.h * cell;

    // Boss body
    ctx.fillStyle = "#7c3aed";
    drawRoundRect(ctx, bx, by, bw, bh, 4);
    ctx.fill();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Boss eyes
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(bx + bw * 0.3, by + bh * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx + bw * 0.7, by + bh * 0.3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Boss HP bar
    const hpW = bw * 0.8;
    const hpH = 4;
    const hpX = bx + (bw - hpW) / 2;
    const hpY = by - 8;
    ctx.fillStyle = "#333";
    drawRoundRect(ctx, hpX, hpY, hpW, hpH, 2);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    drawRoundRect(ctx, hpX, hpY, hpW * (boss.hp / boss.maxHp), hpH, 2);
    ctx.fill();
  }

  // Player body (segments)
  const segCount = player.segments.length;
  for (let i = segCount - 1; i >= 0; i--) {
    const seg = player.segments[i];
    const alpha = 0.3 + 0.7 * (1 - i / segCount);
    ctx.globalAlpha = alpha;
    const segSize = cell * (i === 0 ? 0.9 : 0.65);
    ctx.fillStyle = EVOLUTION_COLORS[player.evolutionLevel] || "#3d8b37";
    ctx.beginPath();
    ctx.arc(seg.x * cell + cell / 2, seg.y * cell + cell / 2, segSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Segment border
    ctx.strokeStyle = "#1a3a1a";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Player head
  if (player.segments.length > 0) {
    const head = player.segments[0];
    drawInusaurHead(
      ctx,
      head.x * cell + cell / 2,
      head.y * cell + cell / 2,
      cell,
      player.evolutionLevel,
      player.isDashing,
      player.isShielded,
      "#f472b6"
    );
  }

  // Particles
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    if (p.type === "text") {
      ctx.font = `bold ${p.size}px monospace`;
      ctx.fillStyle = p.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text || "", p.x, p.y);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Nightfall event overlay
  for (const evt of state.events) {
    if (evt.type === "nightfall" && evt.active) {
      const progress = (Date.now() - evt.startTime) / evt.duration;
      const darkness = Math.sin(progress * Math.PI) * 0.7;
      ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
      ctx.fillRect(
        state.camera.x - width,
        state.camera.y - height,
        width * 2,
        height * 2
      );

      // Light around player
      if (player.segments.length > 0) {
        const head = player.segments[0];
        const hx = head.x * cell + cell / 2;
        const hy = head.y * cell + cell / 2;
        const gradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, cell * 5);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, `rgba(0, 0, 0, ${darkness})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(
          state.camera.x - width,
          state.camera.y - height,
          width * 2,
          height * 2
        );
      }
    }
  }

  // Flash effect
  if (state.flashTimer > 0) {
    ctx.fillStyle = state.flashColor;
    ctx.globalAlpha = state.flashTimer / 10;
    ctx.fillRect(
      state.camera.x - width,
      state.camera.y - height,
      width * 2,
      height * 2
    );
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // ── HUD ──────────────────────────────────────────────────────────────────

  // Score
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`SCORE: ${player.score.toLocaleString()}`, 16, 16);

  // Combo
  if (player.combo > 0) {
    const comboMult = getComboLabel(player.combo);
    ctx.fillStyle = player.combo >= 50 ? "#fbbf24" : player.combo >= 30 ? "#f472b6" : "#4ade80";
    ctx.font = "bold 20px monospace";
    ctx.fillText(`${comboMult} COMBO`, 16, 46);
  }

  // Survival time
  ctx.fillStyle = "#aaa";
  ctx.font = "16px monospace";
  ctx.fillText(formatTime(player.survivalTime), 16, 72);

  // Evolution
  const evoName = EVOLUTION_NAMES[player.evolutionLevel] || "SEED";
  const evoColor = EVOLUTION_COLORS[player.evolutionLevel] || "#4ade80";
  ctx.fillStyle = evoColor;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`🧬 ${evoName}`, width - 16, 16);

  // Level
  ctx.fillStyle = "#aaa";
  ctx.font = "14px monospace";
  ctx.fillText(`LVL ${player.level + 1}`, width - 16, 36);

  // Dash cooldown
  if (player.dashCooldown > 0) {
    ctx.fillStyle = "#666";
    ctx.font = "12px monospace";
    ctx.fillText(`DASH: ${Math.ceil(player.dashCooldown / 1000)}s`, width - 16, 56);
  } else {
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 12px monospace";
    ctx.fillText("DASH: READY", width - 16, 56);
  }

  // Shield
  if (player.isShielded) {
    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`SHIELD: ${Math.ceil(player.shieldTimer / 1000)}s`, width - 16, 76);
  }

  // Perfect run
  if (player.perfectRun && player.perfectRunTimer > 5000) {
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✨ PERFECT RUN", width / 2, 16);
  }

  // Active events
  for (const evt of state.events) {
    if (!evt.active) continue;
    const remaining = Math.ceil((evt.duration - (Date.now() - evt.startTime)) / 1000);
    ctx.fillStyle = "#f472b6";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`⚠️ ${evt.type.toUpperCase()} ${remaining}s`, width / 2, 36);
  }

  // Map name
  ctx.fillStyle = "#444";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${map.name} — ${map.subtitle}`, width / 2, height - 12);
}

function getComboLabel(combo: number): string {
  if (combo >= 100) return "x20";
  if (combo >= 50) return "x10";
  if (combo >= 30) return "x5";
  if (combo >= 15) return "x3";
  if (combo >= 5) return "x2";
  return "x1";
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(2, "0")}`;
}