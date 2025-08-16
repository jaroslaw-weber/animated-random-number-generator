import React, { useEffect, useMemo, useRef, useState } from "react";
import Phaser from "phaser";

// Phaser 3 Marble Race — Long Course (Top-20 camera)
// - Uses Matter physics: circle marbles, static pegs & rotated bumpers, slide sensors
// - Very tall world, camera auto-frames the leading 20 marbles (smooth pan+zoom)
// - Elimination mode + history in React UI
// Drop in any React project that can import Phaser.

const MAX = 88;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// ---- Phaser Scene ----
class RaceScene extends Phaser.Scene {
  worldW!: number;
  worldH!: number;
  finishY!: number;
  marbles!: Phaser.Physics.Matter.Image[];
  pegs!: Phaser.GameObjects.GameObject[];
  bumpers!: Phaser.Physics.Matter.Image[];
  slides!: Phaser.GameObjects.Rectangle[]; // sensors
  cameras!: Phaser.Cameras.Scene2D.CameraManager;
  add!: Phaser.GameObjects.GameObjectFactory;
  matter!: Phaser.Physics.Matter.MatterPhysics;
  time!: Phaser.Time.Clock;
  scale!: Phaser.Scale.ScaleManager;
  running = false;
  onWinner?: (id: number) => void;
  numbers: number[] = []; // which IDs to spawn
  topCount = 20;

  constructor() {
    super("Race");
  }

  init(data: {
    numbers: number[];
    onWinner?: (id: number) => void;
    worldW: number;
    worldH: number;
    finishY: number;
  }) {
    this.numbers = data.numbers;
    this.onWinner = data.onWinner;
    this.worldW = data.worldW;
    this.worldH = data.worldH;
    this.finishY = data.finishY;
  }

  create() {
    const { worldW, worldH } = this;
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    // background
    this.add
      .rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x0a3a18)
      .setDepth(-10);

    // Matter config
    this.matter.world.setBounds(
      0,
      0,
      worldW,
      worldH,
      32,
      true,
      true,
      false,
      true
    );
    this.matter.world.engine.gravity.y = 1.1; // stronger gravity; velocities accumulate naturally

    // slides (sensors that add force downward)
    this.slides = [];
    const slideDefs = [
      { x: worldW * 0.15, y: 500, w: worldW * 0.7, h: 110 },
      { x: worldW * 0.1, y: 1600, w: worldW * 0.8, h: 110 },
      { x: worldW * 0.2, y: 2800, w: worldW * 0.6, h: 130 },
    ];
    for (const s of slideDefs) {
      const r = this.add
        .rectangle(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, 0x44c7f4, 0.18)
        .setDepth(-5);
      this.matter.add.gameObject(r, { isStatic: true, isSensor: true });
      (r as any).isSlide = true;
      this.slides.push(r);
    }

    // pegs (static circles)
    this.pegs = [];
    const rows = 30,
      cols = 10;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = (worldW / (cols + 1)) * (c + 1) + (r % 2 ? 18 : -18);
        const py = 200 + r * 110 + rand(-6, 6);
        const peg = this.add.circle(px, py, 6, 0x9fb3c8).setDepth(-2);
        const matterPeg = this.matter.add.gameObject(peg, {
          isStatic: true,
          shape: { type: "circle", radius: 6 },
        });
        this.pegs.push(matterPeg);
      }
    }

    // bumpers (static rotated rectangles)
    this.bumpers = [];
    const bumps = [
      { x: worldW * 0.25, y: 900, w: 140, h: 14, ang: -0.35 },
      { x: worldW * 0.75, y: 1300, w: 140, h: 14, ang: 0.35 },
      { x: worldW * 0.3, y: 2000, w: 160, h: 14, ang: 0.25 },
      { x: worldW * 0.7, y: 2600, w: 160, h: 14, ang: -0.25 },
    ];
    for (const b of bumps) {
      const rect = this.add
        .rectangle(b.x, b.y, b.w, b.h, 0x2b2f37)
        .setDepth(-1);
      const body = this.matter.add.gameObject(rect, {
        isStatic: true,
      }) as Phaser.Physics.Matter.Image;
      body.setAngle(Phaser.Math.RadToDeg(b.ang));
      body.setIgnoreGravity(true);
      this.bumpers.push(body);
    }

    // finish line visual
    this.add
      .rectangle(worldW / 2, this.finishY, worldW - 20, 4, 0xffffff, 0.9)
      .setDepth(-3);
    this.add
      .text(16, this.finishY - 18, "FINISH", {
        color: "#ffffff",
        fontSize: "12px",
      })
      .setDepth(-3);

    // marbles
    this.marbles = [];
    const radius = 12;
    for (const id of this.numbers) {
      const m = this.matter.add.image(
        worldW / 2 + rand(-60, 60),
        80 - rand(0, 200),
        undefined,
        undefined,
        {
          shape: { type: "circle", radius },
          restitution: 0.9,
          frictionAir: 0.005,
          friction: 0.005,
          frictionStatic: 0,
        }
      );
      m.setCircle(radius);
      m.setTint(
        Phaser.Display.Color.HSVToRGB(((id * 137.5) % 360) / 360, 0.85, 0.95)
          .color
      );
      m.setData("id", id);
      m.setDepth(1);
      // number label
      const label = this.add.text(0, 0, String(id), {
        fontSize: "12px",
        color: "#0b1220",
        fontStyle: "bold",
      });
      label.setOrigin(0.5, 0.55);
      m.setData("label", label); // Store label in data
      this.marbles.push(m);
    }

    // collisions with slides (apply additional downward force when overlapping)
    this.matter.world.on(
      "collisionactive",
      (evt: Phaser.Physics.Matter.Events.CollisionPair) => {
        for (const pair of (evt as any).pairs) {
          const a = pair.bodyA.gameObject as any;
          const b = pair.bodyB.gameObject as any;
          const slideObj = a && a.isSlide ? a : b && b.isSlide ? b : null;
          const marble =
            a && a.getData && a.getData("id")
              ? a
              : b && b.getData && b.getData("id")
              ? b
              : null;
          if (slideObj && marble && marble.body) {
            // apply downward force
            marble.body.force.y += 0.0025; // gentle but continuous while overlapping
          }
        }
      }
    );

    this.running = true;
  }

  update(time: number, delta: number) {
    if (!this.running) return;

    // Keep labels on marbles, check winner, collect positions
    let winnerFound = false;
    const leaders: { x: number; y: number }[] = [];
    for (const m of this.marbles) {
      const id = m.getData("id");
      const label = m.getData("label") as Phaser.GameObjects.Text; // Retrieve label from data
      if (label) {
        label.setPosition(m.x, m.y);
      }
      if (!winnerFound && m.y >= this.finishY) {
        winnerFound = true;
        this.running = false;
        this.time.delayedCall(10, () => this.onWinner && this.onWinner(id));
      }
      leaders.push({ x: m.x, y: m.y });
    }

    // Camera: frame top 20 (smallest y)
    leaders.sort((a, b) => a.y - b.y);
    const top = leaders.slice(0, Math.min(this.topCount, leaders.length));
    if (top.length) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const p of top) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
      const pad = 140;
      const w = maxX - minX + pad,
        h = maxY - minY + pad;
      const cx = (minX + maxX) / 2,
        cy = (minY + maxY) / 2;
      const cam = this.cameras.main;
      // Smooth pan
      cam.pan(cx, cy, 250, "Sine.easeOut", false);
      // Smooth zoom to fit
      const scaleX = this.scale.gameSize.width / (w || 1);
      const scaleY = this.scale.gameSize.height / (h || 1);
      const desiredZoom = clamp(Math.min(scaleX, scaleY), 0.8, 1.8);
      cam.zoomTo(desiredZoom, 300);
    }
  }
}

// ---- React wrapper ----
export default function MarbleRacePhaser() {
  const [noRepeats, setNoRepeats] = useState(true);
  const [history, setHistory] = useState<number[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const remaining = useMemo(() => {
    if (!noRepeats) return Array.from({ length: MAX }, (_, i) => i + 1);
    const taken = new Set(history);
    return Array.from({ length: MAX }, (_, i) => i + 1).filter(
      (n) => !taken.has(n)
    );
  }, [history, noRepeats]);

  // world size (very tall)
  const worldW = 900; // fixed width for clean layout
  const worldH = 4800; // long course
  const finishY = worldH - 80;

  const destroyGame = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  };

  const launchGame = (numbers: number[]) => {
    destroyGame();

    const onWinner = (id: number) => {
      if (noRepeats) setHistory((h) => [...h, id]);
      setIsRacing(false);
      // quick confetti
      const root = document.createElement("div");
      root.style.cssText =
        "pointer-events:none;position:fixed;inset:0;overflow:hidden;z-index:9999";
      for (let i = 0; i < 150; i++) {
        const d = document.createElement("div");
        const size = rand(6, 12);
        d.style.cssText = `position:absolute;top:-10px;width:${size}px;height:${size}px;border-radius:2px;opacity:.95;background:hsl(${randInt(
          0,
          360
        )} 90% 55%);left:${rand(0, 100)}%`;
        (d as any).animate(
          [
            { transform: "translateY(-10px) rotate(0deg)" },
            {
              transform: `translateY(${
                window.innerHeight + 40
              }px) rotate(${randInt(360, 1080)}deg)`,
            },
          ],
          {
            duration: rand(1200, 2000),
            delay: rand(0, 500),
            easing: "cubic-bezier(.2,.8,.2,1)",
            fill: "forwards",
          }
        );
        root.appendChild(d);
      }
      document.body.appendChild(root);
      setTimeout(() => root.remove(), 2400);
    };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: Math.min(1080, containerRef.current!.clientWidth || 1000),
      height: Math.floor(
        Math.min(1080, (containerRef.current!.clientWidth || 1000) * 0.56)
      ),
      backgroundColor: "#0b1220",
      physics: { default: "matter", matter: { gravity: { y: 1.1 } } },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [RaceScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.once(Phaser.Core.Events.READY, () => {
      const scene = game.scene.getScene("Race") as Phaser.Scene;
      scene.scene.restart({ numbers, onWinner, worldW, worldH, finishY });
    });
  };

  useEffect(() => {
    return () => destroyGame();
  }, []);

  const startRace = () => {
    if (isRacing) return;
    if (noRepeats && remaining.length === 0) return;
    setIsRacing(true);
    launchGame(
      noRepeats ? remaining : Array.from({ length: MAX }, (_, i) => i + 1)
    );
  };

  const reset = () => {
    setHistory([]);
    setIsRacing(false);
    destroyGame();
  };

  // UI (inline styles)
  const ui: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(#0b1220,#0e172a)",
      color: "#eef2ff",
      padding: 16,
      display: "flex",
      justifyContent: "center",
    },
    wrap: {
      width: "min(1080px,100%)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    h1: { fontSize: 22, fontWeight: 800, letterSpacing: 0.2 },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    button: {
      padding: "10px 14px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "#22c55e",
      color: "#0b1220",
      fontWeight: 700,
      cursor: "pointer",
    },
    buttonAlt: {
      padding: "10px 14px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "#334155",
      color: "#e2e8f0",
      fontWeight: 600,
      cursor: "pointer",
    },
    checkbox: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13,
      opacity: 0.9,
    },
    canvasWrap: {
      borderRadius: 18,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    },
    history: {
      display: "grid",
      gridTemplateColumns: "repeat(11, minmax(0,1fr))",
      gap: 6,
    },
    chip: {
      display: "grid",
      placeItems: "center",
      aspectRatio: "1/1",
      borderRadius: 12,
      background: "rgba(148,163,184,.1)",
      border: "1px solid rgba(255,255,255,0.1)",
      fontWeight: 700,
    },
    chipHit: {
      background: "rgba(34,197,94,.2)",
      border: "1px solid rgba(34,197,94,.4)",
      color: "#86efac",
    },
    small: { fontSize: 12, opacity: 0.8 },
  };

  return (
    <div style={ui.page}>
      <div style={ui.wrap}>
        <div style={ui.header}>
          <div style={ui.h1}>Phaser Marble Race — Long Course</div>
          <div style={ui.controls}>
            <label style={ui.checkbox}>
              <input
                type="checkbox"
                checked={noRepeats}
                onChange={(e) => setNoRepeats(e.target.checked)}
              />{" "}
              No repeats (elimination)
            </label>
            <button style={ui.buttonAlt} onClick={reset}>
              Reset
            </button>
            <button
              style={ui.button}
              onClick={startRace}
              disabled={isRacing || (noRepeats && remaining.length === 0)}
            >
              {isRacing ? "Racing…" : "Start Race"}
            </button>
          </div>
        </div>

        <div style={ui.canvasWrap}>
          <div ref={containerRef} style={{ width: "100%", height: "60vh" }} />
        </div>

        <div style={ui.small}>Numbers (winners highlighted)</div>
        <div style={ui.history}>
          {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => {
            const hit = history.includes(n);
            return (
              <div key={n} style={{ ...ui.chip, ...(hit ? ui.chipHit : {}) }}>
                {n}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
