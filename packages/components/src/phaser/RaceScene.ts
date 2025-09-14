import { createWalls } from "./objects/Walls";
import { createSlides } from "./objects/Slides";
import { createPegs } from "./objects/Pegs";
import { createBumpers } from "./objects/Bumpers";
import {
  createMarbles,
  updateMarbles,
  checkMarbleBounds,
} from "./objects/Marbles";
import { type GameConfig } from "../utils/configLoader";

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
  gameConfig!: GameConfig; // Add gameConfig property

  constructor() {
    super("Race");
  }

  init(data: {
    numbers: number[];
    onWinner?: (id: number) => void;
    worldW: number;
    worldH: number;
    finishY: number;
    gameConfig: GameConfig; // Add gameConfig to init data
  }) {
    this.numbers = data.numbers || [];
    this.onWinner = data.onWinner;
    this.worldW = data.worldW;
    this.worldH = data.worldH;
    this.finishY = data.finishY;
    this.gameConfig = data.gameConfig; // Store gameConfig
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

    createWalls(this, worldW, worldH);
    this.slides = createSlides(this, worldW);
    this.pegs = createPegs(this, worldW, worldH);
    this.bumpers = createBumpers(this, worldW);

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

    this.marbles = createMarbles(this, this.numbers, worldW, this.gameConfig);

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
    updateMarbles(
      this,
      this.marbles,
      this.finishY,
      this.onWinner,
      this.running
    );
    checkMarbleBounds(this, this.marbles, this.worldW, this.worldH);

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
      const desiredZoom = Math.min(scaleX, scaleY);
      cam.zoomTo(desiredZoom, 750); // Increased duration for smoother zoom
    }
  }
}
