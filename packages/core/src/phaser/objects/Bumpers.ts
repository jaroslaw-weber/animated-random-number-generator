import Phaser from "phaser";

export function createBumpers(
  scene: Phaser.Scene,
  worldW: number
): Phaser.Physics.Matter.Image[] {
  const bumpers: Phaser.Physics.Matter.Image[] = [];
  const bumps = [
    { x: worldW * 0.25, y: 450, w: 140, h: 14, ang: -0.35 },
    { x: worldW * 0.75, y: 650, w: 140, h: 14, ang: 0.35 },
    { x: worldW * 0.35, y: 1000, w: 160, h: 14, ang: 0.25 },
    { x: worldW * 0.65, y: 1300, w: 160, h: 14, ang: -0.25 },
    { x: worldW * 0.4, y: 1600, w: 180, h: 14, ang: -0.3 },
    { x: worldW * 0.6, y: 1900, w: 180, h: 14, ang: 0.3 },
  ];
  for (const b of bumps) {
    const rect = scene.add.rectangle(b.x, b.y, b.w, b.h, 0x000000).setDepth(-1);
    const body = scene.matter.add.gameObject(rect, {
      isStatic: true,
    }) as Phaser.Physics.Matter.Image;
    body.setAngle(Phaser.Math.RadToDeg(b.ang));
    body.setIgnoreGravity(true);
    bumpers.push(body);
  }
  return bumpers;
}
