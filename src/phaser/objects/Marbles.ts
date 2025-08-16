import Phaser from "phaser";
import { rand, clamp } from "../../utils/math";
import { type GameConfig } from "../../utils/configLoader";

export function createMarbles(
  scene: Phaser.Scene,
  numbers: number[],
  worldW: number,
  gameConfig: GameConfig
): Phaser.Physics.Matter.Sprite[] {
  const marbles: Phaser.Physics.Matter.Sprite[] = [];
  const radius = 16;

  for (let i = 0; i < numbers.length; i++) {
    const id = numbers[i];
    const x = worldW / 2 + rand(-60, 60);
    const y = 80 - rand(0, 200);

    let marbleText: string;
    if (gameConfig.mode === "nameList") {
      marbleText = gameConfig.nameList[id - 1] || String(id);
    } else {
      marbleText = String(id);
    }

    const circle = scene.add.circle(x, y, radius, 0xffffff);
    circle.setFillStyle(
      Phaser.Display.Color.HSVToRGB(((id * 137.5) % 360) / 360, 0.85, 0.95)
        .color
    );
    circle.setDepth(1);

    const m = scene.matter.add.gameObject(circle, {
      shape: { type: "circle", radius },
      restitution: 1.1,
      frictionAir: 0.01,
      friction: 0.01,
      frictionStatic: 0,
    }) as Phaser.Physics.Matter.Sprite;
    m.setData("id", id);
    m.setData("circle", circle);

    const labelBg = scene.add.graphics();
    labelBg.setDepth(1.5);
    m.setData("labelBg", labelBg);

    const label = scene.add
      .text(0, 0, marbleText, {
        fontSize: "14px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setDepth(2);
    label.setOrigin(0.5, 0.5);
    m.setData("label", label);
    marbles.push(m);
  }
  return marbles;
}

export function updateMarbles(
  scene: Phaser.Scene,
  marbles: Phaser.Physics.Matter.Sprite[],
  finishY: number,
  onWinner: ((id: number) => void) | undefined,
  running: boolean
) {
  if (!running) return;

  let winnerFound = false;
  for (let i = marbles.length - 1; i >= 0; i--) {
    const m = marbles[i];
    const id = m.getData("id");
    const label = m.getData("label") as Phaser.GameObjects.Text;
    const labelBg = m.getData("labelBg") as Phaser.GameObjects.Graphics;
    const circle = m.getData("circle") as Phaser.GameObjects.Arc;

    label.x = m.x;
    label.y = m.y;
    labelBg.x = m.x;
    labelBg.y = m.y;

    labelBg.clear();
    const marbleColor = circle.fillColor as number;
    const circleRadius = 10;
    const outlineThickness = 2;

    labelBg.lineStyle(outlineThickness, marbleColor, 1);
    labelBg.strokeCircle(0, 0, circleRadius + outlineThickness / 2);

    labelBg.fillStyle(0xffffff, 1);
    labelBg.fillCircle(0, 0, circleRadius);

    if (label) {
      label.setPosition(m.x, m.y);
    }

    if (m.y >= finishY) {
      if (!winnerFound) {
        winnerFound = true;
        scene.time.delayedCall(10, () => onWinner && onWinner(id));
      }
      label?.destroy();
      m.destroy();
      marbles.splice(i, 1);
    }
  }
}

export function checkMarbleBounds(
  scene: Phaser.Scene,
  marbles: Phaser.Physics.Matter.Sprite[],
  worldW: number,
  worldH: number
) {
  const outOfBoundsY = worldH + 100;
  const initialTrackWidth = worldW * 0.8;
  const finalTrackWidth = worldW * 0.4;
  const trackWidthDecreasePerPx =
    (initialTrackWidth - finalTrackWidth) / worldH;
  const wallPhysicsThickness = 20;
  const marbleRadius = 12;

  for (let i = marbles.length - 1; i >= 0; i--) {
    const m = marbles[i];
    const label = m.getData("label") as Phaser.GameObjects.Text;

    if (m.y > outOfBoundsY) {
      label?.destroy();
      m.destroy();
      marbles.splice(i, 1);
      continue;
    }

    const currentTrackWidth = clamp(
      initialTrackWidth - m.y * trackWidthDecreasePerPx,
      finalTrackWidth,
      initialTrackWidth
    );
    const startX = (worldW - currentTrackWidth) / 2;
    const endX = startX + currentTrackWidth;

    const marbleLeftBound = m.x - marbleRadius;
    const marbleRightBound = m.x + marbleRadius;

    const buffer = 5;

    if (
      marbleLeftBound < startX - wallPhysicsThickness - buffer ||
      marbleRightBound > endX + wallPhysicsThickness + buffer
    ) {
      label?.destroy();
      m.destroy();
      marbles.splice(i, 1);
    }
  }
}
