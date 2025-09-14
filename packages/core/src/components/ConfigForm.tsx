import React, { useState, useEffect } from "react";
import { ModeSwitcher } from "./ModeSwitcher";
import { NumberRangeConfig } from "./NumberRangeConfig";
import { NameListConfig } from "./NameListConfig";

interface GameConfig {
  mode: "numberRange" | "nameList";
  numberRange?: {
    min: number;
    max: number;
  };
  nameList?: string[];
}

export function ConfigForm() {
  const [mode, setMode] = useState<"numberRange" | "nameList">("numberRange");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [names, setNames] = useState(["Alice", "Bob", "Charlie"]);

  useEffect(() => {
    const savedConfig = localStorage.getItem("gameConfig");
    if (savedConfig) {
      const config: GameConfig = JSON.parse(savedConfig);
      setMode(config.mode);
      if (config.numberRange) {
        setMin(config.numberRange.min);
        setMax(config.numberRange.max);
      }
      if (config.nameList) {
        setNames(config.nameList);
      }
    }
  }, []);

  const handleSave = () => {
    let configToSave: GameConfig;
    if (mode === "numberRange") {
      configToSave = {
        mode: "numberRange",
        numberRange: { min, max },
      };
    } else {
      configToSave = {
        mode: "nameList",
        nameList: names,
      };
    }
    localStorage.setItem("gameConfig", JSON.stringify(configToSave));
    alert("Configuration saved!");
  };

  return (
    <div className="config-form">
      <h1>Game Configuration</h1>
      <ModeSwitcher currentMode={mode} onModeChange={setMode} />

      {mode === "numberRange" ? (
        <NumberRangeConfig
          initialMin={min}
          initialMax={max}
          onRangeChange={(newMin, newMax) => {
            setMin(newMin);
            setMax(newMax);
          }}
        />
      ) : (
        <NameListConfig initialNames={names} onNamesChange={setNames} />
      )}

      <button onClick={handleSave}>Save Configuration</button>
    </div>
  );
}
