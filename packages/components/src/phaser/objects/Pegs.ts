import Phaser from "phaser";
import { clamp } from "../../utils/math";

export function createPegs(
  scene: Phaser.Scene,
  worldW: number,
  worldH: number
): Phaser.GameObjects.GameObject[] {
  const pegs: Phaser.GameObjects.GameObject[] = [];
  const rows = 15,
    cols = 10;
  const initialTrackWidth = worldW * 0.8;
  const finalTrackWidth = worldW * 0.4;
  const trackWidthDecreasePerPx =
    (initialTrackWidth - finalTrackWidth) / worldH;

  const pegRadius = 8;
  const pegColor = 0x000000;

  for (let r = 0; r < rows; r++) {
    const y = (worldH / rows) * (r + 0.5);
    const currentTrackWidth = clamp(
      initialTrackWidth - y * trackWidthDecreasePerPx,
      finalTrackWidth,
      initialTrackWidth
    );
    const startX = (worldW - currentTrackWidth) / 2;
    const endX = startX + currentTrackWidth;

    const effectiveCols = Math.max(
      5,
      Math.floor((currentTrackWidth / worldW) * cols)
    );
    const colSpacing = currentTrackWidth / (effectiveCols + 1);

    for (let c = 0; c < effectiveCols; c++) {
      const x = startX + colSpacing * (c + 1);
      const circle = scene.add.circle(x, y, pegRadius, pegColor).setDepth(-2);
      const body = scene.matter.add.gameObject(circle, {
        isStatic: true,
        shape: { type: "circle", radius: pegRadius },
      }) as Phaser.Physics.Matter.Image;
      pegs.push(body);
    }
  }
  return pegs;
}
