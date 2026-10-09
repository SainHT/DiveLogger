import { useEffect, useMemo, useState } from "react";
import { calculateMOD } from "../../modules/physics/utils/gasCalculations";
import { getSampledNDLDepths } from "../../modules/physics/utils/depthSampler";
import { BaseInput } from "../components/common/BaseInput";
import { NdlLookupTable } from "../components/planner/NdlLookupTable";
import { InteractiveProfileGraph } from "../components/planner/InteractiveProfileGraph";
import { generateDivePlanFromTotalTime } from "../../modules/physics/utils/profilePlanner";

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
  const [totalTime, setTotalTime] = useState(45);
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
  const isPPO2Warning = ppo2 >= 1.35;
  const standardDepths = getSampledNDLDepths(mod, isMobile);
  const plan = useMemo(
    () => generateDivePlanFromTotalTime(safeDepth, totalTime, fO2, gfHigh),
    [safeDepth, totalTime, fO2, gfHigh],
  );

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

      <section className={isPPO2Warning ? "panel planner-profile planner-profile-warning" : "panel planner-profile"}>
        <div className="section-heading">
          <div><span className="eyebrow">PROFILE PREVIEW</span><h2>Interactive dive profile</h2></div>
          <span className={isPPO2Warning ? "planner-ppo2-badge warning" : "planner-ppo2-badge"}>
            <strong>{isPPO2Warning ? "⚠ High PPO₂ Warning: " : "PPO₂: "}{ppo2.toFixed(2)} bar</strong>
            {isPPO2Warning && <span> — Approaching 1.40 bar PPO₂ Safety Limit!</span>}
          </span>
        </div>
        <InteractiveProfileGraph samples={plan.samples} maxDepth={safeDepth} hasDeepStop={plan.hasDeepStop} deepStopDepth={plan.deepStopDepthMeters} safetyStopDuration={plan.safetyStopDurationMinutes} />
        <div className="planner-profile-metrics">
          <div><span className="eyebrow">NDL</span><strong>{plan.ndlMinutes} min</strong></div>
          <div><span className="eyebrow">BOTTOM TIME</span><strong>{plan.maximizedBottomTimeMinutes} min</strong></div>
          <div><span className="eyebrow">MOD</span><strong>{mod.toFixed(1)} m</strong></div>
          <div><span className="eyebrow">GF LOW / HIGH</span><strong>{Math.round(gfLow * 100)} / {Math.round(gfHigh * 100)}%</strong></div>
        </div>
        {plan.isDecoDive && <p className="planner-warning danger">Decompression warning: requested runtime exceeds the no-decompression limit.</p>}
      </section>

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
          label="Total planned dive time (min)"
          type="number"
          min="1"
          max="180"
          step="1"
          value={totalTime}
          onChange={(event) => setTotalTime(Math.min(180, Math.max(1, Number(event.target.value))))}
        />
      </section>

    </div>
  );
}
