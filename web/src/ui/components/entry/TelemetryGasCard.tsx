import { BaseInput } from "../common/BaseInput";
import { FormSection, SelectField } from "./EntryFormPrimitives";
import type { FormState } from "../../hooks/useDiveEntry";
import type { RecreationalGas, WaterType } from "@scuba-log/shared/modules/dives/domain/dive.model";

type Props = {
  form: FormState;
  set: (key: keyof FormState, value: string | undefined) => void;
  setTime: (key: "diveStart" | "diveEnd" | "duration", value: string) => void;
  mod: number;
  consumption: { sacBarMin: number; rmvLmin: number | null };
};

export function TelemetryGasCard({
  form,
  set,
  setTime,
  mod,
  consumption,
}: Props) {
  return (
    <FormSection title="Depths, duration and gas">
      <div className="form-grid mobile-layout">
        <BaseInput
          className="mobile-full"
          label="Dive start"
          type="time"
          value={form.diveStart}
          onChange={(e) => setTime("diveStart", e.target.value)}
          required
        />
        <BaseInput
          className="mobile-full"
          label="Duration (min)"
          type="number"
          placeholder="e.g. 60"
          value={form.duration || ""}
          onChange={(e) => setTime("duration", e.target.value)}
          required
        />
        <BaseInput
          className="mobile-full"
          label="Dive end"
          type="time"
          value={form.diveEnd}
          onChange={(e) => setTime("diveEnd", e.target.value)}
          required
        />
        <BaseInput
          className="mobile-half"
          label="Max depth (m)"
          type="number"
          step="0.1"
          placeholder="e.g. 30"
          value={form.maxDepthMeters || ""}
          onChange={(e) => set("maxDepthMeters", e.target.value)}
          required
        />
        <BaseInput
          className="mobile-half"
          label="Average depth (m)"
          type="number"
          step="0.1"
          placeholder="e.g. 18"
          value={form.avgDepthMeters ?? ""}
          onChange={(e) => set("avgDepthMeters", e.target.value)}
        />
        <label className="field mobile-full">
          <span className="field-label">Water type</span>
          <select
            value={form.waterType}
            onChange={(e) => set("waterType", e.target.value as WaterType)}
          >
            <option>Salt</option>
            <option>Fresh</option>
            <option>Brackish</option>
          </select>
        </label>
        <BaseInput
          className="mobile-half"
          label="Start pressure (bar)"
          type="number"
          placeholder="e.g. 200"
          value={form.startPressureBar}
          onChange={(e) => set("startPressureBar", e.target.value)}
          required
        />
        <BaseInput
          className="mobile-half"
          label="End pressure (bar)"
          type="number"
          placeholder="e.g. 50"
          value={form.endPressureBar}
          onChange={(e) => set("endPressureBar", e.target.value)}
          required
        />
        <label className="field mobile-full">
          <span className="field-label">Gas mix</span>
          <select
            value={form.gasMix}
            onChange={(e) => set("gasMix", e.target.value as RecreationalGas)}
          >
            <option>AIR</option>
            <option>EAN32</option>
            <option>EAN36</option>
          </select>
          <small className="hint">Recommended MOD: {mod.toFixed(1)} m</small>
        </label>
        <BaseInput
          className="mobile-half"
          label="Tank capacity (L)"
          type="number"
          placeholder="e.g. 12"
          value={form.tankCapacityLiters ?? ""}
          onChange={(e) => set("tankCapacityLiters", e.target.value)}
        />
        <SelectField
          className="mobile-half"
          label="Tank type"
          value={form.tankType}
          options={["Single", "Doubles", "Sidemount", "Rebreather", "Other"]}
          onChange={(value) => set("tankType", value)}
        />
      </div>
      <div className="calculation-callout" aria-live="polite">
        <span>
          <strong>SAC</strong> {consumption.sacBarMin.toFixed(2)} bar/min
        </span>
        <span>
          <strong>RMV</strong>{" "}
          {consumption.rmvLmin == null
            ? "—"
            : `${consumption.rmvLmin.toFixed(2)} L/min`}
        </span>
      </div>
    </FormSection>
  );
}
