import Phaser from "phaser";
import { rand, randInt, clamp } from "../utils/math";

export class RaceScene extends Phaser.Scene {
  worldW!: number;
  worldH!: number;
  finishY!: number;
  marbles!: Phaser.Physics.Matter.Sprite[];
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

  preload() {
    // No image preloading needed for SVG-like marbles
  }

  create() {
    const { worldW, worldH } = this;
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    // background
    this.add
      .rectangle(worldW / 2, worldH / 2, worldW, worldH, 0xd3d3d3)
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
    this.matter.world.setGravity(0, 0.15); // Adjust global gravity

    // Track width calculations (moved here for reuse)
    const initialTrackWidth = worldW * 0.8; // Initial width at the top
    const finalTrackWidth = worldW * 0.4; // Final width at the bottom
    const trackWidthDecreasePerPx =
      (initialTrackWidth - finalTrackWidth) / worldH;

    // Add static walls that follow the narrowing track
    const wallSegmentHeight = 100;
    const wallVisualThickness = 10; // Visual thickness for debugging
    const wallPhysicsThickness = 20; // Physics thickness for collision

    for (let y = -200; y < worldH; y += wallSegmentHeight) {
      const currentTrackWidth = clamp(
        initialTrackWidth - y * trackWidthDecreasePerPx,
        finalTrackWidth,
        initialTrackWidth
      );
      const startX = (worldW - currentTrackWidth) / 2;
      const endX = startX + currentTrackWidth;

      // Left wall segment
      this.matter.add.rectangle(
        startX - wallPhysicsThickness / 2, // X position of left wall segment
        y + wallSegmentHeight / 2, // Y position of segment center
        wallPhysicsThickness,
        wallSegmentHeight,
        { isStatic: true, label: "leftWall" }
      );
      // Visual for left wall
      this.add
        .rectangle(
          startX - wallVisualThickness / 2,
          y + wallSegmentHeight / 2,
          wallVisualThickness,
          wallSegmentHeight,
          0x000000, // Black color for walls
          0.5
        )
        .setDepth(-5);

      // Right wall segment
      this.matter.add.rectangle(
        endX + wallPhysicsThickness / 2, // X position of right wall segment
        y + wallSegmentHeight / 2, // Y position of segment center
        wallPhysicsThickness,
        wallSegmentHeight,
        { isStatic: true, label: "rightWall" }
      );
      // Visual for right wall
      this.add
        .rectangle(
          endX + wallVisualThickness / 2,
          y + wallSegmentHeight / 2,
          wallVisualThickness,
          wallSegmentHeight,
          0x000000, // Black color for walls
          0.5
        )
        .setDepth(-5);
    }

    // slides (sensors that add force downward)
    this.slides = [];
    const slideDefs = [
      { x: worldW * 0.15, y: 250, w: worldW * 0.7, h: 110 },
      { x: worldW * 0.1, y: 800, w: worldW * 0.8, h: 110 },
      { x: worldW * 0.2, y: 1400, w: worldW * 0.6, h: 130 },
    ];
    for (const s of slideDefs) {
      const r = this.add
        .rectangle(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, 0xb0e0e6, 0.18)
        .setDepth(-5);
      this.matter.add.gameObject(r, { isStatic: true, isSensor: true });
      (r as any).isSlide = true;
      this.slides.push(r);
    }

    // pegs (static circles)
    this.pegs = [];
    const rows = 15,
      cols = 10;
    // initialTrackWidth, finalTrackWidth, trackWidthDecreasePerPx are now defined above

    const pegRadius = 8;
    const pegColor = 0x000000; // Black color for pegs

    for (let r = 0; r < rows; r++) {
      const y = (worldH / rows) * (r + 0.5); // Distribute rows evenly
      const currentTrackWidth = clamp(
        initialTrackWidth - y * trackWidthDecreasePerPx,
        finalTrackWidth,
        initialTrackWidth
      );
      const startX = (worldW - currentTrackWidth) / 2;
      const endX = startX + currentTrackWidth;

      // Adjust cols based on currentTrackWidth to maintain density
      const effectiveCols = Math.max(
        5,
        Math.floor((currentTrackWidth / worldW) * cols)
      );
      const colSpacing = currentTrackWidth / (effectiveCols + 1);

      for (let c = 0; c < effectiveCols; c++) {
        const x = startX + colSpacing * (c + 1);
        const circle = this.add.circle(x, y, pegRadius, pegColor).setDepth(-2);
        const body = this.matter.add.gameObject(circle, {
          isStatic: true,
          shape: { type: "circle", radius: pegRadius },
        }) as Phaser.Physics.Matter.Image;
        this.pegs.push(body);
      }
    }

    // bumpers (static rotated rectangles)
    this.bumpers = [];
    const bumps = [
      { x: worldW * 0.25, y: 450, w: 140, h: 14, ang: -0.35 }, // Top-left
      { x: worldW * 0.75, y: 650, w: 140, h: 14, ang: 0.35 }, // Top-right
      { x: worldW * 0.35, y: 1000, w: 160, h: 14, ang: 0.25 }, // Mid-left (adjusted)
      { x: worldW * 0.65, y: 1300, w: 160, h: 14, ang: -0.25 }, // Mid-right (adjusted)
      { x: worldW * 0.4, y: 1600, w: 180, h: 14, ang: -0.3 }, // Lower-left (new)
      { x: worldW * 0.6, y: 1900, w: 180, h: 14, ang: 0.3 }, // Lower-right (new)
    ];
    for (const b of bumps) {
      const rect = this.add
        .rectangle(b.x, b.y, b.w, b.h, 0x000000)
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
      .rectangle(worldW / 2, this.finishY, worldW - 20, 4, 0xfff0f5, 0.9)
      .setDepth(-3);
    this.add
      .text(16, this.finishY - 18, "FINISH", {
        color: "#FFFAF0",
        fontSize: "12px",
      })
      .setDepth(-3);

    // marbles
    this.marbles = [];
    const radius = 16;
    for (const id of this.numbers) {
      const x = worldW / 2 + rand(-60, 60);
      const y = 80 - rand(0, 200);

      // Create a graphics object for the marble
      const circle = this.add.circle(x, y, radius, 0xffffff); // Start with white, will be tinted
      circle.setFillStyle(
        Phaser.Display.Color.HSVToRGB(((id * 137.5) % 360) / 360, 0.85, 0.95)
          .color
      );
      circle.setDepth(1);

      // Add the circle to Matter.js physics
      const m = this.matter.add.gameObject(circle, {
        shape: { type: "circle", radius },
        restitution: 1.1,
        frictionAir: 0.01,
        friction: 0.01,
        frictionStatic: 0,
      }) as Phaser.Physics.Matter.Sprite;
      m.setData("id", id);
      m.setData("circle", circle); // Store the circle object

      // number label background (white circle with colored outline)
      const labelBg = this.add.graphics();
      labelBg.setDepth(1.5); // Between marble and text
      m.setData("labelBg", labelBg); // Store graphics object in data

      // number label
      const label = this.add
        .text(0, 0, String(id), {
          fontSize: "14px",
          color: "#000000", // Set text color to black
          fontStyle: "bold",
        })
        .setDepth(2); // Set depth higher than marble
      label.setOrigin(0.5, 0.5); // Center text precisely
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
          marble.body.force.y += 0.0015; // gentle but continuous while overlapping
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
    // Iterate backward to safely remove marbles that cross the finish line
    for (let i = this.marbles.length - 1; i >= 0; i--) {
      const m = this.marbles[i];
      const id = m.getData("id");
      const label = m.getData("label") as Phaser.GameObjects.Text;
      const labelBg = m.getData("labelBg") as Phaser.GameObjects.Graphics;
      const circle = m.getData("circle") as Phaser.GameObjects.Arc; // Get the original circle object

      // Update label and background position
      label.x = m.x;
      label.y = m.y;
      labelBg.x = m.x;
      labelBg.y = m.y;

      // Redraw the label background
      labelBg.clear();
      const marbleColor = circle.fillColor as number; // Get the marble's color from the circle object
      const circleRadius = 10; // Radius for the white circle
      const outlineThickness = 2; // Thickness of the outline

      // Draw colorful outline
      labelBg.lineStyle(outlineThickness, marbleColor, 1);
      labelBg.strokeCircle(0, 0, circleRadius + outlineThickness / 2);

      // Draw white circle
      labelBg.fillStyle(0xffffff, 1);
      labelBg.fillCircle(0, 0, circleRadius);

      if (label) {
        label.setPosition(m.x, m.y);
      }

      if (m.y >= this.finishY) {
        if (!winnerFound) {
          // Only trigger winner logic for the first one
          winnerFound = true;
          this.running = false;
          this.time.delayedCall(10, () => this.onWinner && this.onWinner(id));
        }
        // Destroy marble and label
        label?.destroy();
        m.destroy();
        this.marbles.splice(i, 1); // Remove from array
      } else {
        // Only add to leaders if not destroyed
        leaders.push({ x: m.x, y: m.y });
      }
    }

    this.checkMarbleBounds(); // Call the new method to check and destroy out-of-bounds marbles

    // Camera: track all active marbles horizontally and the lowest marble vertically
    let minX = Infinity;
    let maxX = -Infinity;
    let lowestY = -Infinity;

    for (const m of this.marbles) {
      minX = Math.min(minX, m.x);
      maxX = Math.max(maxX, m.x);
      lowestY = Math.max(lowestY, m.y);
    }

    if (this.marbles.length > 0) {
      const cam = this.cameras.main;
      const horizontalPadding = 100; // Padding for horizontal view
      const verticalPadding = 280; // Padding for vertical view

      const targetWidth = maxX - minX + horizontalPadding;
      const targetHeight = verticalPadding; // Keep vertical padding for zoom calculation

      const cameraTargetX = minX + (targetWidth - horizontalPadding) / 2;
      const cameraTargetY = lowestY;

      // Smooth camera follow using lerp
      const lerpFactor = 0.08; // Adjust this value for desired smoothness (0.0 - 1.0)
      cam.scrollX += (cameraTargetX - cam.width / 2 - cam.scrollX) * lerpFactor;
      cam.scrollY +=
        (cameraTargetY - cam.height / 2 - cam.scrollY) * lerpFactor;

      // Smooth zoom to fit
      const scaleX = this.scale.gameSize.width / (targetWidth || 1);
      const scaleY = this.scale.gameSize.height / (targetHeight || 1);
      const desiredZoom = clamp(Math.min(scaleX, scaleY), 0.5, 2.5);
      cam.zoomTo(desiredZoom, 750); // Increased duration for smoother zoom
    }
  }

  // New method to check and destroy marbles that fall out of bounds
  private checkMarbleBounds() {
    const { worldW, worldH } = this;
    const outOfBoundsY = worldH + 100; // A bit below the world height

    // Track width calculations (re-used from create method)
    const initialTrackWidth = worldW * 0.8; // Initial width at the top
    const finalTrackWidth = worldW * 0.4; // Final width at the bottom
    const trackWidthDecreasePerPx =
      (initialTrackWidth - finalTrackWidth) / worldH;
    const wallPhysicsThickness = 20;

    for (let i = this.marbles.length - 1; i >= 0; i--) {
      const m = this.marbles[i];
      const label = m.getData("label") as Phaser.GameObjects.Text;

      // Check if marble is too far down
      if (m.y > outOfBoundsY) {
        label?.destroy();
        m.destroy();
        this.marbles.splice(i, 1);
        continue;
      }

      // Check if marble is outside the dynamic wall boundaries
      // Use the known marble radius (12) for boundary checks
      const marbleRadius = 12; // Defined on line 211 in create()

      const currentTrackWidth = clamp(
        initialTrackWidth - m.y * trackWidthDecreasePerPx,
        finalTrackWidth,
        initialTrackWidth
      );
      const startX = (worldW - currentTrackWidth) / 2;
      const endX = startX + currentTrackWidth;

      const marbleLeftBound = m.x - marbleRadius;
      const marbleRightBound = m.x + marbleRadius;

      // Allow for a small buffer to prevent premature destruction
      const buffer = 5;

      if (
        marbleLeftBound < startX - wallPhysicsThickness - buffer ||
        marbleRightBound > endX + wallPhysicsThickness + buffer
      ) {
        label?.destroy();
        m.destroy();
        this.marbles.splice(i, 1);
      }
    }
  }
}
