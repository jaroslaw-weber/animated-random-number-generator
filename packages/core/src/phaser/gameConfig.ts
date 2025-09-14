import Phaser from "phaser";
import { RaceScene } from "./RaceScene";

export const onWinner = (
  id: number,
  setHistory: React.Dispatch<React.SetStateAction<number[]>>,
  setIsRacing: React.Dispatch<React.SetStateAction<boolean>>,
  setWinningMarbleId: React.Dispatch<React.SetStateAction<number | null>>,
  noRepeats: boolean
) => {
  if (noRepeats) setHistory((h) => [...h, id]);
  setIsRacing(false);
  setWinningMarbleId(id);
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
          transform: `translateY(${window.innerHeight + 40}px) rotate(${randInt(
            360,
            1080
          )}deg)`,
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

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container", // This will be updated in MarbleRace.tsx
  width: 1000, // This will be updated in MarbleRace.tsx
  height: 560, // This will be updated in MarbleRace.tsx
  backgroundColor: "#D3D3D3",
  physics: { default: "matter", matter: { gravity: { x: 0, y: 2 } } },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [RaceScene],
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
