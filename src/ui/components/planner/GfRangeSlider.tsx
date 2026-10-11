interface Props {
  gfLow: number;
  gfHigh: number;
  onChange: (gfLow: number, gfHigh: number) => void;
}

const PRESETS = [
  { label: "Conservative", low: 0.3, high: 0.7 },
  { label: "Medium", low: 0.4, high: 0.85 },
  { label: "Lenient", low: 0.5, high: 0.9 },
];

export function GfRangeSlider({ gfLow, gfHigh, onChange }: Props) {
  return (
    <div className="planner-control-group">
      <div className="planner-control-heading">
        <span className="field-label">Gradient factors (low / high)</span>
        <strong className="hint">{Math.round(gfLow * 100)} / {Math.round(gfHigh * 100)}%</strong>
      </div>
      <div className="planner-gf-track">
        <div className="planner-gf-track-background" />
        <div
          className="planner-gf-track-active"
          style={{
            left: `${((gfLow - 0.3) / 0.65) * 100}%`,
            right: `${100 - ((gfHigh - 0.3) / 0.65) * 100}%`,
          }}
        />
        <input
          aria-label="GF Low"
          className={gfHigh - gfLow <= 0.05 ? "planner-gf-thumb-low" : undefined}
          type="range"
          min="0.3"
          max="0.7"
          step="0.05"
          value={gfLow}
          onChange={(event) => onChange(Math.min(Number(event.target.value), gfHigh), gfHigh)}
        />
        <input
          aria-label="GF High"
          className={gfHigh - gfLow <= 0.05 ? "planner-gf-thumb-high" : undefined}
          type="range"
          min="0.7"
          max="0.95"
          step="0.05"
          value={gfHigh}
          onChange={(event) => onChange(gfLow, Math.max(Number(event.target.value), gfLow))}
        />
      </div>
      <div className="planner-presets" aria-label="Gradient factor presets">
        {PRESETS.map((preset) => (
          <button
            type="button"
            className="planner-preset"
            key={preset.label}
            onClick={() => onChange(preset.low, preset.high)}
          >
            {preset.label} ({Math.round(preset.low * 100)}/{Math.round(preset.high * 100)})
          </button>
        ))}
      </div>
    </div>
  );
}
