import { h } from "preact";
import { useState, useEffect } from "preact/hooks";

interface NumberRangeConfigProps {
  initialMin: number;
  initialMax: number;
  onRangeChange: (min: number, max: number) => void;
}

export function NumberRangeConfig({
  initialMin,
  initialMax,
  onRangeChange,
}: NumberRangeConfigProps) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);

  useEffect(() => {
    onRangeChange(min, max);
  }, [min, max, onRangeChange]);

  return (
    <div className="number-range-config">
      <label>
        Min:
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(Number(e.currentTarget.value))}
        />
      </label>
      <label>
        Max:
        <input
          type="number"
          value={max}
          onChange={(e) => setMax(Number(e.currentTarget.value))}
        />
      </label>
    </div>
  );
}
