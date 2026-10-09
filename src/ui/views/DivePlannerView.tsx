import { useEffect, useMemo, useState } from "react";
import { calculateNDL } from "../../modules/physics/engine/buhlmann";
import { calculateEAD, calculateMOD } from "../../modules/physics/utils/gasCalculations";
import { getSampledNDLDepths } from "../../modules/physics/utils/depthSampler";
import { BaseInput } from "../components/common/BaseInput";
import { NdlLookupTable } from "../components/planner/NdlLookupTable";
import { ProfileVisualizer, type ProfilePoint } from "../components/planner/ProfileVisualizer";

const GAS_OPTIONS = [
  { label: "Air (21%)", fO2: 0.21 },
  { label: "EAN32 (32%)", fO2: 0.32 },
  { label: "EAN36 (36%)", fO2: 0.36 },
];
const GF_PRESETS = [
  { label: "Conservative", low: 0.3, high: 0.7, display: "30 / 70" },
  { label: "Medium", low: 0.4, high: 0.85, display: "40 / 85" },
  { label: "Lenient", low: 0.5, high: 0.9, display: "50 / 90" },
];

export function DivePlannerView() {
  const [depth, setDepth] = useState(18);
  const [time, setTime] = useState(40);
  const [fO2, setFO2] = useState(0.21);
  const [gfLow, setGfLow] = useState(0.4);
  const [gfHigh, setGfHigh] = useState(0.85);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 640);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);
  const mod = calculateMOD(fO2);
  const safeDepth = Math.min(Math.max(0, depth), mod);
  const ppo2 = (1 + safeDepth / 10) * fO2;
  const ndl = calculateNDL(safeDepth, fO2, gfHigh);
  const ead = calculateEAD(safeDepth, fO2);
  const standardDepths = getSampledNDLDepths(mod, isMobile);
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

      <section className="panel planner-setup">
        <div className="section-heading">
          <div><span className="eyebrow">DIVE SETUP</span><h2>Plan this dive</h2></div>
        </div>
        <div className="planner-setup-grid">
          <label className="field">
            <span className="field-label">Gas mix</span>
            <select value={fO2} onChange={(event) => setFO2(Number(event.target.value))}>
              {GAS_OPTIONS.map((gas) => <option key={gas.fO2} value={gas.fO2}>{gas.label}</option>)}
            </select>
          </label>
          <div className="planner-gf-presets">
            <span className="field-label">Gradient factors</span>
            <div className="planner-preset-toggle" role="group" aria-label="Gradient factor presets">
              {GF_PRESETS.map((preset) => {
                const isActive = gfLow === preset.low && gfHigh === preset.high;
                return (
                  <button
                    type="button"
                    className={isActive ? "planner-preset active" : "planner-preset"}
                    key={preset.label}
                    aria-pressed={isActive}
                    onClick={() => {
                      setGfLow(preset.low);
                      setGfHigh(preset.high);
                    }}
                  >
                    <span>{preset.label}</span>
                    <strong>{preset.display}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="planner-control-heading">
          <span className="field-label">Target depth</span>
          <strong className="hint">{safeDepth.toFixed(1)} m / {mod.toFixed(1)} m MOD</strong>
        </div>
        <input
          aria-label="Target depth"
          type="range"
          min="10"
          max={mod}
          step="0.1"
          value={safeDepth}
          onChange={(event) => setDepth(Number(event.target.value))}
        />
        <BaseInput
          label="Bottom time (min)"
          type="number"
          min="1"
          max="180"
          step="1"
          value={time}
          onChange={(event) => setTime(Math.min(180, Math.max(1, Number(event.target.value))))}
        />
      </section>

    </div>
  );
}
