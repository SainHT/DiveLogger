import { useMemo, useState } from "react";
import { calculateNDL } from "../../modules/physics/engine/buhlmann";
import { calculateEAD, calculateMOD } from "../../modules/physics/utils/gasCalculations";
import { BaseInput } from "../components/common/BaseInput";

const DEPTHS = [10, 15, 20, 25, 30, 35, 40];
const GAS_OPTIONS = [
  { label: "Air (21%)", fO2: 0.21 },
  { label: "EAN32 (32%)", fO2: 0.32 },
  { label: "EAN36 (36%)", fO2: 0.36 },
];

export function DivePlannerView() {
  const [depth, setDepth] = useState(20);
  const [fO2, setFO2] = useState(0.21);
  const [gradientFactorHigh, setGradientFactorHigh] = useState(0.85);
  const ndl = useMemo(
    () => calculateNDL(depth, fO2, gradientFactorHigh),
    [depth, fO2, gradientFactorHigh],
  );
  const mod = calculateMOD(fO2);
  const ead = calculateEAD(depth, fO2);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">PLANNING / ZH-L16C</span>
          <h1>Plan your next dive.</h1>
          <p className="muted">Explore no-decompression limits with gradient factors.</p>
        </div>
      </section>
      <section className="panel planner-controls">
        <label className="field">
          <span className="field-label">Gas mix</span>
          <select value={fO2} onChange={(event) => setFO2(Number(event.target.value))}>
            {GAS_OPTIONS.map((gas) => (
              <option key={gas.fO2} value={gas.fO2}>{gas.label}</option>
            ))}
          </select>
        </label>
        <BaseInput
          label="Target depth (m)"
          type="number"
          min="0"
          max={mod}
          step="1"
          value={depth}
          onChange={(event) => setDepth(Math.max(0, Number(event.target.value)))}
        />
        <label className="field">
          <span className="field-label">GF High: {Math.round(gradientFactorHigh * 100)}%</span>
          <input
            type="range"
            min="0.6"
            max="0.9"
            step="0.01"
            value={gradientFactorHigh}
            onChange={(event) => setGradientFactorHigh(Number(event.target.value))}
          />
        </label>
      </section>
      <section className="detail-stats planner-stats">
        <div className="detail-stat"><span className="eyebrow">NDL</span><strong>{ndl} min</strong></div>
        <div className="detail-stat"><span className="eyebrow">MOD @ 1.4 PPO2</span><strong>{mod.toFixed(1)} m</strong></div>
        <div className="detail-stat"><span className="eyebrow">EAD</span><strong>{ead.toFixed(1)} m</strong></div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <div><span className="eyebrow">NDL TABLE</span><h2>Limits by depth</h2></div>
          <span className="muted">GF High {Math.round(gradientFactorHigh * 100)}%</span>
        </div>
        <div className="planner-depths">
          {DEPTHS.map((targetDepth) => (
            <button
              className={targetDepth === depth ? "planner-depth selected" : "planner-depth"}
              key={targetDepth}
              onClick={() => setDepth(targetDepth)}
              disabled={targetDepth > mod}
            >
              <span>{targetDepth} m</span>
              <strong>{calculateNDL(targetDepth, fO2, gradientFactorHigh)} min</strong>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
