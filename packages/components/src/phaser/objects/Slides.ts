import Phaser from "phaser";

export function createSlides(
  scene: Phaser.Scene,
  worldW: number
): Phaser.GameObjects.Rectangle[] {
  const slides: Phaser.GameObjects.Rectangle[] = [];
  const slideDefs = [
    { x: worldW * 0.15, y: 250, w: worldW * 0.7, h: 110 },
    { x: worldW * 0.1, y: 800, w: worldW * 0.8, h: 110 },
    { x: worldW * 0.2, y: 1400, w: worldW * 0.6, h: 130 },
  ];
  for (const s of slideDefs) {
    const r = scene.add
      .rectangle(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, 0xb0e0e6, 0.18)
      .setDepth(-5);
    scene.matter.add.gameObject(r, { isStatic: true, isSensor: true });
    (r as any).isSlide = true;
    slides.push(r);
  }
  return slides;
}
