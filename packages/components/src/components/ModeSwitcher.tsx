import React from "react";

interface ModeSwitcherProps {
  currentMode: "numberRange" | "nameList";
  onModeChange: (mode: "numberRange" | "nameList") => void;
}

export function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher">
      <label>
        <input
          type="radio"
          name="configMode"
          value="numberRange"
          checked={currentMode === "numberRange"}
          onChange={() => onModeChange("numberRange")}
        />
        Number Range
      </label>
      <label>
        <input
          type="radio"
          name="configMode"
          value="nameList"
          checked={currentMode === "nameList"}
          onChange={() => onModeChange("nameList")}
        />
        Name List
      </label>
    </div>
  );
}
