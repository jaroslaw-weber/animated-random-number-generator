import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

interface NameListConfigProps {
  initialNames: string[];
  onNamesChange: (names: string[]) => void;
}

export function NameListConfig({
  initialNames,
  onNamesChange,
}: NameListConfigProps) {
  const [namesText, setNamesText] = useState(initialNames.join("\n"));

  useEffect(() => {
    const namesArray = namesText
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    onNamesChange(namesArray);
  }, [namesText, onNamesChange]);

  return (
    <div className="name-list-config">
      <label>
        Names (one per line):
        <textarea
          value={namesText}
          onChange={(e) => setNamesText(e.currentTarget.value)}
          rows={10}
          cols={30}
        />
      </label>
    </div>
  );
}
