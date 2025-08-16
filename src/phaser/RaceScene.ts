import Phaser from "phaser";
import { rand, randInt, clamp } from "../utils/math";

export class RaceScene extends Phaser.Scene {
  worldW!: number;
  worldH!: number;
  finishY!: number;
  marbles!: Phaser.Physics.Matter.Image[];
  pegs!: Phaser.GameObjects.GameObject[];
  bumpers!: Phaser.Physics.Matter.Image[];
  slides!: Phaser.GameObjects.Rectangle[]; // sensors
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
    this.numbers = data.numbers || [];
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
        "",
        "",
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
    this.matter.world.on("collisionactive", (evt: MatterJS.ICollisionPair) => {
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
    });

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
