// ─── Inusaur Run — Input Handler ─────────────────────────────────────────────

import type { Direction, TouchState } from "./types";

export interface InputCallbacks {
  onDirection: (dir: Direction) => void;
  onDash: () => void;
  onBrake: (on: boolean) => void;
  onPause: () => void;
  onStart: () => void;
}

// ── Keyboard Input ───────────────────────────────────────────────────────────

export function setupKeyboardInput(callbacks: InputCallbacks): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        e.preventDefault();
        callbacks.onDirection("UP");
        break;
      case "ArrowDown":
      case "s":
      case "S":
        e.preventDefault();
        callbacks.onDirection("DOWN");
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        e.preventDefault();
        callbacks.onDirection("LEFT");
        break;
      case "ArrowRight":
      case "d":
      case "D":
        e.preventDefault();
        callbacks.onDirection("RIGHT");
        break;
      case " ":
        e.preventDefault();
        callbacks.onPause();
        break;
      case "Shift":
        e.preventDefault();
        callbacks.onDash();
        break;
      case "Enter":
        e.preventDefault();
        callbacks.onStart();
        break;
      case "b":
      case "B":
        callbacks.onBrake(true);
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "b" || e.key === "B") {
      callbacks.onBrake(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}

// ── Touch / Swipe Input ──────────────────────────────────────────────────────

export function setupTouchInput(
  canvas: HTMLCanvasElement,
  callbacks: InputCallbacks
): () => void {
  const touchState: TouchState = {
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    swiping: false,
    direction: null,
  };

  const SWIPE_THRESHOLD = 30;
  const SWIPE_TIME_LIMIT = 500;

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.startTime = Date.now();
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;
    touchState.swiping = true;
    touchState.direction = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!touchState.swiping) return;
    const touch = e.touches[0];
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;

    const dx = touchState.currentX - touchState.startX;
    const dy = touchState.currentY - touchState.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > SWIPE_THRESHOLD) {
      const elapsed = Date.now() - touchState.startTime;
      if (elapsed < SWIPE_TIME_LIMIT) {
        if (Math.abs(dx) > Math.abs(dy)) {
          touchState.direction = dx > 0 ? "RIGHT" : "LEFT";
        } else {
          touchState.direction = dy > 0 ? "DOWN" : "UP";
        }
        callbacks.onDirection(touchState.direction);
        touchState.swiping = false;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    touchState.swiping = false;

    // Tap detection (short touch, no swipe)
    const elapsed = Date.now() - touchState.startTime;
    if (elapsed < 200) {
      // Double tap for dash
      // (handled by double tap detection below)
    }
  };

  // Double tap for dash
  let lastTap = 0;
  const handleDoubleTap = (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      callbacks.onDash();
    }
    lastTap = now;
  };

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
  canvas.addEventListener("touchend", handleDoubleTap, { passive: false });

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
    canvas.removeEventListener("touchend", handleDoubleTap);
  };
}

// ── Virtual D-Pad ────────────────────────────────────────────────────────────

export function createVirtualDPad(
  container: HTMLElement,
  callbacks: InputCallbacks
): () => void {
  const pad = document.createElement("div");
  pad.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 140px;
    height: 140px;
    z-index: 100;
    pointer-events: auto;
  `;

  const btnSize = 44;
  const directions: { dir: Direction; x: number; y: number; label: string }[] = [
    { dir: "UP", x: 48, y: 0, label: "▲" },
    { dir: "DOWN", x: 48, y: 96, label: "▼" },
    { dir: "LEFT", x: 0, y: 48, label: "◀" },
    { dir: "RIGHT", x: 96, y: 48, label: "▶" },
  ];

  for (const d of directions) {
    const btn = document.createElement("button");
    btn.textContent = d.label;
    btn.style.cssText = `
      position: absolute;
      left: ${d.x}px;
      top: ${d.y}px;
      width: ${btnSize}px;
      height: ${btnSize}px;
      border-radius: 50%;
      background: rgba(61, 139, 55, 0.5);
      border: 2px solid rgba(74, 222, 128, 0.4);
      color: #4ade80;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      transition: background 0.1s;
    `;

    const handleTouch = (e: Event) => {
      e.preventDefault();
      callbacks.onDirection(d.dir);
      btn.style.background = "rgba(74, 222, 128, 0.5)";
      setTimeout(() => {
        btn.style.background = "rgba(61, 139, 55, 0.5)";
      }, 100);
    };

    btn.addEventListener("touchstart", handleTouch, { passive: false });
    btn.addEventListener("mousedown", handleTouch);
    pad.appendChild(btn);
  }

  // Center button (dash)
  const dashBtn = document.createElement("button");
  dashBtn.textContent = "⚡";
  dashBtn.style.cssText = `
    position: absolute;
    left: 48px;
    top: 48px;
    width: ${btnSize}px;
    height: ${btnSize}px;
    border-radius: 50%;
    background: rgba(250, 204, 21, 0.4);
    border: 2px solid rgba(250, 204, 21, 0.6);
    color: #facc15;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  `;
  const handleDash = (e: Event) => {
    e.preventDefault();
    callbacks.onDash();
  };
  dashBtn.addEventListener("touchstart", handleDash, { passive: false });
  dashBtn.addEventListener("mousedown", handleDash);
  pad.appendChild(dashBtn);

  container.appendChild(pad);

  return () => {
    if (pad.parentNode) pad.parentNode.removeChild(pad);
  };
}