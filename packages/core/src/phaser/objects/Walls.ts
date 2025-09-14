import Phaser from "phaser";
import { clamp } from "../../utils/math";

export function createWalls(
  scene: Phaser.Scene,
  worldW: number,
  worldH: number
) {
  const initialTrackWidth = worldW * 0.8; // Initial width at the top
  const finalTrackWidth = worldW * 0.4; // Final width at the bottom
  const trackWidthDecreasePerPx =
    (initialTrackWidth - finalTrackWidth) / worldH;

  const wallSegmentHeight = 100;
  const wallVisualThickness = 10;
  const wallPhysicsThickness = 20;

  for (let y = -200; y < worldH; y += wallSegmentHeight) {
    const currentTrackWidth = clamp(
      initialTrackWidth - y * trackWidthDecreasePerPx,
      finalTrackWidth,
      initialTrackWidth
    );
    const startX = (worldW - currentTrackWidth) / 2;
    const endX = startX + currentTrackWidth;

    // Left wall segment
    scene.matter.add.rectangle(
      startX - wallPhysicsThickness / 2,
      y + wallSegmentHeight / 2,
      wallPhysicsThickness,
      wallSegmentHeight,
      { isStatic: true, label: "leftWall" }
    );
    scene.add
      .rectangle(
        startX - wallVisualThickness / 2,
        y + wallSegmentHeight / 2,
        wallVisualThickness,
        wallSegmentHeight,
        0x000000,
        0.5
      )
      .setDepth(-5);

    // Right wall segment
    scene.matter.add.rectangle(
      endX + wallPhysicsThickness / 2,
      y + wallSegmentHeight / 2,
      wallPhysicsThickness,
      wallSegmentHeight,
      { isStatic: true, label: "rightWall" }
    );
    scene.add
      .rectangle(
        endX + wallVisualThickness / 2,
        y + wallSegmentHeight / 2,
        wallVisualThickness,
        wallSegmentHeight,
        0x000000,
        0.5
      )
      .setDepth(-5);
  }
}
