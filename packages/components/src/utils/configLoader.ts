export interface GameConfig {
  mode: "numberRange" | "nameList";
  numberRange: {
    min: number;
    max: number;
  };
  nameList: string[];
}

const DEFAULT_CONFIG: GameConfig = {
  mode: "numberRange",
  numberRange: {
    min: 1,
    max: 100,
  },
  nameList: [],
};

export function getGameConfig(): GameConfig {
  try {
    const configString = localStorage.getItem("gameConfig");
    if (configString) {
      const parsedConfig: GameConfig = JSON.parse(configString);
      // Basic validation to ensure the parsed config has expected structure
      if (
        parsedConfig.mode &&
        ((parsedConfig.mode === "numberRange" &&
          parsedConfig.numberRange &&
          typeof parsedConfig.numberRange.min === "number" &&
          typeof parsedConfig.numberRange.max === "number") ||
          (parsedConfig.mode === "nameList" &&
            Array.isArray(parsedConfig.nameList)))
      ) {
        return { ...DEFAULT_CONFIG, ...parsedConfig };
      }
    }
  } catch (error) {
    console.error("Error parsing game config from localStorage:", error);
  }
  return DEFAULT_CONFIG;
}
