import { useMemo, useState } from "react";
import { calculateNDL } from "../../modules/physics/engine/buhlmann";
import { calculateEAD, calculateMOD } from "../../modules/physics/utils/gasCalculations";
import { BaseInput } from "../components/common/BaseInput";
import { GfRangeSlider } from "../components/planner/GfRangeSlider";
import { NdlLookupTable } from "../components/planner/NdlLookupTable";
import { ProfileVisualizer, type ProfilePoint } from "../components/planner/ProfileVisualizer";

const DEPTHS = [12, 15, 18, 20, 24, 27, 30, 33, 36, 40];
const GAS_OPTIONS = [
  { label: "Air (21%)", fO2: 0.21 },
  { label: "EAN32 (32%)", fO2: 0.32 },
  { label: "EAN36 (36%)", fO2: 0.36 },
];

export function DivePlannerView() {
  const [depth, setDepth] = useState(18);
  const [time, setTime] = useState(40);
  const [fO2, setFO2] = useState(0.21);
  const [customFO2, setCustomFO2] = useState(0.4);
  const [isCustomGas, setIsCustomGas] = useState(false);
  const [gfLow, setGfLow] = useState(0.4);
  const [gfHigh, setGfHigh] = useState(0.85);
  const mod = calculateMOD(fO2);
  const safeDepth = Math.min(Math.max(0, depth), mod);
  const ppo2 = (1 + safeDepth / 10) * fO2;
  const ndl = calculateNDL(safeDepth, fO2, gfHigh);
  const ead = calculateEAD(safeDepth, fO2);
  const standardDepths = DEPTHS.filter((standardDepth) => standardDepth <= mod);
  const profile = useMemo<ProfilePoint[]>(() => {
    const descentMinutes = 2;
    const ascentMinutes = 3;
    const sample = (sampleTime: number, sampleDepth: number): ProfilePoint => ({
      time: sampleTime,
      depth: sampleDepth,
      ppo2: (1 + sampleDepth / 10) * fO2,
    });
    return [
      sample(0, 0),
      sample(descentMinutes, safeDepth),
      sample(descentMinutes + time, safeDepth),
      sample(descentMinutes + time + ascentMinutes, 0),
    ];
  }, [fO2, safeDepth, time]);

  const selectGas = (value: string) => {
    if (value === "custom") {
      setIsCustomGas(true);
      setFO2(customFO2);
      return;
    }
    setIsCustomGas(false);
    setFO2(Number(value));
  };

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">PLANNING / RECREATIONAL</span>
          <h1>Recreational Dive Planner</h1>
          <p className="muted">Single-gas planning with conservative PPO₂ limits.</p>
        </div>
        <span className="planner-mode">Single-gas mode</span>
      </section>

      <NdlLookupTable depths={standardDepths} selectedDepth={safeDepth} fO2={fO2} gradientFactorHigh={gfHigh} onSelect={setDepth} />

      <ProfileVisualizer points={profile} metrics={{ ndl, mod, ead, gfLow, gfHigh, ppo2 }} />

      <section className="panel planner-depth-control">
        <div className="section-heading">
          <div><span className="eyebrow">PROFILE CONTROLS</span><h2>Target depth & duration</h2></div>
        </div>
        <div className="planner-control-heading">
          <span className="field-label">Target depth</span>
          <strong className="hint">{safeDepth.toFixed(1)} m / {mod.toFixed(1)} m MOD</strong>
        </div>
        <input
          aria-label="Target depth"
          type="range"
          min="0"
          max={mod}
          step="0.1"
          value={safeDepth}
          onChange={(event) => setDepth(Number(event.target.value))}
        />
        <BaseInput
          label="Target depth (m)"
          type="number"
          min="0"
          max={mod}
          step="1"
          value={safeDepth}
          onChange={(event) => setDepth(Math.min(mod, Math.max(0, Number(event.target.value))))}
        />
        <label className="field">
          <span className="field-label">Bottom time: {time} min</span>
          <input type="range" min="1" max="300" step="1" value={time} onChange={(event) => setTime(Number(event.target.value))} />
        </label>
        <BaseInput
          label="Bottom time (min)"
          type="number"
          min="1"
          max="300"
          step="1"
          value={time}
          onChange={(event) => setTime(Math.min(300, Math.max(1, Number(event.target.value))))}
        />
      </section>

      <section className="panel planner-settings">
        <div className="section-heading">
          <div><span className="eyebrow">SETTINGS</span><h2>Gas mix & gradient factors</h2></div>
        </div>
        <div className="planner-settings-grid">
          <label className="field">
            <span className="field-label">Gas mix</span>
            <select value={GAS_OPTIONS.some((gas) => gas.fO2 === fO2) ? fO2 : "custom"} onChange={(event) => selectGas(event.target.value)}>
              {GAS_OPTIONS.map((gas) => <option key={gas.fO2} value={gas.fO2}>{gas.label}</option>)}
              <option value="custom">Custom mix</option>
            </select>
          </label>
          {isCustomGas && (
            <BaseInput
              label="Custom O₂ (%)"
              type="number"
              min="21"
              max="40"
              step="1"
              value={Math.round(customFO2 * 100)}
              onChange={(event) => {
                const value = Math.min(40, Math.max(21, Number(event.target.value)));
                setCustomFO2(value / 100);
                setFO2(value / 100);
              }}
            />
          )}
          <GfRangeSlider gfLow={gfLow} gfHigh={gfHigh} onChange={(low, high) => { setGfLow(low); setGfHigh(high); }} />
        </div>
      </section>
    </div>
  );
}
