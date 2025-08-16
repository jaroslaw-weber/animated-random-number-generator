import React, { useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../utils/math";
import { gameConfig, onWinner } from "../phaser/gameConfig";
import { RaceScene } from "../phaser/RaceScene";
import { ui } from "../styles/raceStyles";
import { worldW, worldH, finishY } from "../constants/game";
import { getGameConfig, type GameConfig } from "../utils/configLoader";

// ---- React wrapper ----
export default function MarbleRacePhaser() {
  const [noRepeats, setNoRepeats] = useState(true);
  const [history, setHistory] = useState<number[]>([]);
  const [isRacing, setIsRacing] = useState(false);
  const [winningMarbleId, setWinningMarbleId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameSettings, setGameSettings] = useState<GameConfig>(getGameConfig());

  useEffect(() => {
    setGameSettings(getGameConfig());
  }, []);

  const maxNumber = useMemo(() => {
    return gameSettings.mode === "numberRange"
      ? gameSettings.numberRange.max
      : gameSettings.nameList.length;
  }, [gameSettings]);

  const remaining = useMemo(() => {
    if (!noRepeats) return Array.from({ length: maxNumber }, (_, i) => i + 1);
    const taken = new Set(history);
    return Array.from({ length: maxNumber }, (_, i) => i + 1).filter(
      (n) => !taken.has(n)
    );
  }, [history, noRepeats, maxNumber]);

  const destroyGame = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
  };

  const launchGame = (numbers: number[], config: GameConfig) => {
    destroyGame();

    const currentConfig = {
      ...gameConfig,
      parent: containerRef.current!,
      width: Math.min(1080, containerRef.current!.clientWidth || 1000),
      height: Math.floor(
        Math.min(1080, (containerRef.current!.clientWidth || 1000) * 0.56)
      ),
    };
    console.log(
      `[MarbleRace.tsx] Phaser Canvas Dimensions: Width = ${currentConfig.width}, Height = ${currentConfig.height}`
    );

    const game = new Phaser.Game(currentConfig);
    gameRef.current = game;

    game.events.once(Phaser.Core.Events.READY, () => {
      const scene = game.scene.getScene("Race") as Phaser.Scene;
      scene.scene.restart({
        numbers,
        onWinner: (id: number) =>
          onWinner(id, setHistory, setIsRacing, setWinningMarbleId, noRepeats),
        worldW,
        worldH,
        finishY,
        gameConfig: config, // Pass the loaded game config
      });
    });
  };

  useEffect(() => {
    return () => destroyGame();
  }, []);

  const startRace = () => {
    if (isRacing) return;
    if (noRepeats && remaining.length === 0) return;
    setIsRacing(true);
    setWinningMarbleId(null); // Reset winning marble ID at the start of a new race
    launchGame(
      noRepeats
        ? remaining
        : Array.from({ length: maxNumber }, (_, i) => i + 1),
      gameSettings
    );
  };

  const reset = () => {
    setHistory([]);
    setIsRacing(false);
    setWinningMarbleId(null); // Reset winning marble ID on reset
    destroyGame();
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
          {winningMarbleId !== null && !isRacing && (
            <div style={ui.winnerDisplay}>
              Winner: <span style={ui.winnerNumber}>{winningMarbleId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
