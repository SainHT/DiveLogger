import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PresetSelector } from "../../modules/equipment/components/PresetSelector";
import { applyPresetToDiveForm } from "../../modules/equipment/hooks/usePresetAutofill";
import type {
  DiveLog,
  RecreationalGas,
  WaterType,
} from "../../modules/dives/domain/dive.model";
import {
  createDive,
  getAllDives,
  updateDive,
  type NewDiveLog,
} from "../../storage/repositories/diveRepository";
import { savePreset } from "../../storage/repositories/presetRepository";
import { BaseButton } from "../components/common/BaseButton";
import { BaseInput } from "../components/common/BaseInput";
import { RatingStars } from "../components/common/RatingStars";
import { calculateSAC } from "../../modules/physics/utils/gasCalculations";

type FormState = Omit<NewDiveLog, "diveNumber" | "duration"> & {
  diveNumber: number;
  duration: number;
  diveStart: string;
  diveEnd: string;
};
const now = new Date();
const initial: FormState = {
  diveNumber: 1,
  date: now.toISOString().slice(0, 10),
  diveStart: "09:00",
  diveEnd: "10:00",
  location: "",
  siteName: "",
  diveType: "Reef",
  buddy: "",
  duration: 60,
  maxDepthMeters: 0,
  avgDepthMeters: undefined,
  gasMix: "AIR",
  waterType: "Salt",
  startPressureBar: 200,
  endPressureBar: 50,
  tankCapacityLiters: 12,
  tankType: "Single",
  weightKg: 0,
  suitType: "5mm",
  specialEquipment: "",
  maxWaterTempCelsius: undefined,
  minWaterTempCelsius: undefined,
  avgWaterTempCelsius: undefined,
  visibilityMeters: undefined,
  weather: "",
  specialConditions: "",
  notes: "",
  rating: 0,
};
const numeric = [
  "diveNumber",
  "duration",
  "maxDepthMeters",
  "avgDepthMeters",
  "startPressureBar",
  "endPressureBar",
  "tankCapacityLiters",
  "weightKg",
  "maxWaterTempCelsius",
  "minWaterTempCelsius",
  "avgWaterTempCelsius",
  "visibilityMeters",
] as const;

function minutesBetween(start: string, end: string) {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  let difference =
    endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
  if (difference < 0) difference += 24 * 60;
  return difference;
}
function addMinutes(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const total = (hours * 60 + mins + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function DiveEntryView({
  nextNumber,
  editingDive,
  onCancel,
  onSaved,
}: {
  nextNumber: number;
  editingDive?: DiveLog;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    editingDive
      ? {
          ...initial,
          ...editingDive,
          duration: Math.round(editingDive.duration / 60),
          diveStart:
            editingDive.diveStart ??
            (editingDive.startTime == null
              ? ""
              : `${String(Math.floor(editingDive.startTime / 60)).padStart(2, "0")}:${String(editingDive.startTime % 60).padStart(2, "0")}`),
          diveEnd:
            editingDive.diveEnd ??
            (editingDive.endTime == null
              ? ""
              : `${String(Math.floor(editingDive.endTime / 60)).padStart(2, "0")}:${String(editingDive.endTime % 60).padStart(2, "0")}`),
        }
      : { ...initial, diveNumber: nextNumber },
  );
  const [saving, setSaving] = useState(false);
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!editingDive)
      void getAllDives().then((dives) => {
        const highest = dives.reduce(
          (max, dive) => Math.max(max, dive.diveNumber),
          0,
        );
        setForm((current) => ({
          ...current,
          diveNumber: Math.max(nextNumber, highest + 1),
        }));
      });
  }, [editingDive, nextNumber]);
  const set = (key: keyof FormState, raw: string | undefined) =>
    setForm((current) => ({
      ...current,
      [key]: numeric.includes(key as (typeof numeric)[number])
        ? raw == null || raw === ""
          ? undefined
          : Number(raw)
        : raw,
    }));
  const setTime = (key: "diveStart" | "diveEnd" | "duration", raw: string) =>
    setForm((current) => {
      const next = {
        ...current,
        [key]: key === "duration" ? Number(raw) : raw,
      };
      if (key === "duration" && next.diveStart && next.duration)
        next.diveEnd = addMinutes(next.diveStart, next.duration);
      else if (key === "diveStart" && next.diveStart && next.duration)
        next.diveEnd = addMinutes(next.diveStart, next.duration);
      else if (key === "diveEnd" && next.diveEnd && next.diveStart)
        next.duration = minutesBetween(next.diveStart, next.diveEnd);
      return next;
    });
  const applyPreset = (preset: Parameters<typeof applyPresetToDiveForm>[1]) =>
    setForm((current) => ({
      ...current,
      ...applyPresetToDiveForm(current, preset),
    }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const {
        diveStart,
        diveEnd,
        duration,
        id: _id,
        updatedAt: _updatedAt,
        isSynced: _isSynced,
        isDeleted: _isDeleted,
        ...rest
      } = form as FormState &
        Partial<Pick<DiveLog, "id" | "updatedAt" | "isSynced" | "isDeleted">>;
      const data = {
        ...rest,
        date: form.date.slice(0, 10),
        duration: duration * 60,
        diveStart,
        diveEnd,
      };
      if (saveAsPreset) {
        const name = window.prompt("Name this equipment preset");
        if (name?.trim())
          await savePreset({
            id: crypto.randomUUID(),
            name: name.trim(),
            suitType: form.suitType,
            weightKg: form.weightKg,
            tankCapacityLiters: form.tankCapacityLiters,
            tankType: form.tankType,
            specialEquipment: form.specialEquipment,
            updatedAt: Date.now(),
          });
      }
      if (editingDive) await updateDive(editingDive.id, data);
      else await createDive(data);
      onSaved();
    } catch {
      setError("Unable to save this dive locally. Please try again.");
      setSaving(false);
    }
  };
  const fO2 = form.gasMix === "AIR" ? 0.21 : form.gasMix === "EAN32" ? 0.32 : 0.36;
  const consumption = calculateSAC({
    startPressureBar: form.startPressureBar,
    endPressureBar: form.endPressureBar,
    durationMinutes: form.duration,
    avgDepthMeters: form.avgDepthMeters ?? form.maxDepthMeters,
    tankCapacityLiters: form.tankCapacityLiters,
  });
  const mod = ((1.4 / fO2) - 1) * 10;
  return (
    <div className="page-stack">
      <button className="back-link" onClick={onCancel}>
        <ArrowLeft size={16} /> Cancel and go back
      </button>
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            LOGBOOK / {editingDive ? "EDIT ENTRY" : "NEW ENTRY"}
          </span>
          <h1>{editingDive ? "Update your dive." : "Log a new dive."}</h1>
          <p className="muted">Capture the details while they are fresh.</p>
        </div>
      </section>
      <form className="entry-form" onSubmit={submit}>
        <FormSection title="General information">
          <div className="form-grid mobile-layout">
            <BaseInput
              className="mobile-half"
              label="Dive number"
              type="number"
              placeholder="e.g. 200"
              value={form.diveNumber}
              onChange={(e) => set("diveNumber", e.target.value)}
              required
            />
            <BaseInput
              className="mobile-half"
              label="Dive date"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
            <BaseInput
              className="mobile-full"
              label="Buddy"
              placeholder="e.g. Buddy Name"
              value={form.buddy}
              onChange={(e) => set("buddy", e.target.value)}
            />
            <BaseInput
              className="mobile-full"
              label="Site name"
              placeholder="e.g. Blue Hole"
              value={form.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              required
            />
            <BaseInput
              className="mobile-full"
              label="Location"
              placeholder="e.g. Dahab, Egypt"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              required
            />
            <BaseInput
              className="mobile-full"
              label="Dive type"
              placeholder="e.g. Shore, Night"
              value={form.diveType}
              onChange={(e) => set("diveType", e.target.value)}
            />
          </div>
        </FormSection>
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
                onChange={(e) =>
                  set("gasMix", e.target.value as RecreationalGas)
                }
              >
                <option>AIR</option>
                <option>EAN32</option>
                <option>EAN36</option>
              </select>
              <small className="hint">
                Recommended MOD: {mod.toFixed(1)} m
              </small>
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
              options={[
                "Single",
                "Doubles",
                "Sidemount",
                "Rebreather",
                "Other",
              ]}
              onChange={(value) =>
                set("tankType", value as FormState["tankType"])
              }
            />
          </div>
          <div className="calculation-callout" aria-live="polite">
            <span><strong>SAC</strong> {consumption.sacBarMin.toFixed(2)} bar/min</span>
            <span><strong>RMV</strong> {consumption.rmvLmin == null ? "—" : `${consumption.rmvLmin.toFixed(2)} L/min`}</span>
          </div>
        </FormSection>
        <FormSection title="Gear and environment">
          <PresetSelector onSelectPreset={applyPreset} />
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={saveAsPreset}
              onChange={(e) => setSaveAsPreset(e.target.checked)}
            />{" "}
            Save these settings as a new preset
          </label>
          <div className="form-grid mobile-layout">
            <BaseInput
              className="mobile-half"
              label="Weight (kg)"
              type="number"
              step="0.1"
              placeholder="e.g. 6"
              value={form.weightKg || ""}
              onChange={(e) => set("weightKg", e.target.value)}
              required
            />
            <SelectField
              className="mobile-half"
              label="Suit type"
              value={form.suitType || ""}
              options={["Shorty", "3mm", "5mm", "7mm", "Semi-Dry", "Drysuit"]}
              onChange={(value) =>
                set("suitType", value as FormState["suitType"])
              }
            />
            <BaseInput
              className="mobile-full"
              label="Special equipment"
              placeholder="e.g. DSMB, camera"
              value={form.specialEquipment}
              onChange={(e) => set("specialEquipment", e.target.value)}
            />
            <BaseInput
              className="mobile-third"
              label="Min temp (°C)"
              type="number"
              step="0.1"
              placeholder="e.g. 22"
              value={form.minWaterTempCelsius ?? ""}
              onChange={(e) => set("minWaterTempCelsius", e.target.value)}
            />
            <BaseInput
              className="mobile-third"
              label="Avg temp (°C)"
              type="number"
              step="0.1"
              placeholder="e.g. 23"
              value={form.avgWaterTempCelsius ?? ""}
              onChange={(e) => set("avgWaterTempCelsius", e.target.value)}
            />
            <BaseInput
              className="mobile-third"
              label="Max temp (°C)"
              type="number"
              step="0.1"
              placeholder="e.g. 24"
              value={form.maxWaterTempCelsius ?? ""}
              onChange={(e) => set("maxWaterTempCelsius", e.target.value)}
            />
            <BaseInput
              className="mobile-two-thirds"
              label="Weather"
              placeholder="e.g. Sunny"
              value={form.weather}
              onChange={(e) => set("weather", e.target.value)}
            />
            <BaseInput
              className="mobile-third"
              label="Visibility (m)"
              type="number"
              step="0.1"
              placeholder="e.g. 20"
              value={form.visibilityMeters ?? ""}
              onChange={(e) => set("visibilityMeters", e.target.value)}
            />
            <BaseInput
              className="mobile-full"
              label="Special conditions"
              placeholder="e.g. Strong current"
              value={form.specialConditions}
              onChange={(e) => set("specialConditions", e.target.value)}
            />
          </div>
        </FormSection>
        <FormSection title="Notes and rating">
          <div className="form-grid">
            <label className="field full-field">
              <span className="field-label">Personal notes</span>
              <textarea
                rows={5}
                placeholder="e.g. Calm descent and clear visibility"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
            <div className="field">
              <span className="field-label">Rating</span>
              <RatingStars
                value={form.rating}
                interactive
                onChange={(rating) =>
                  setForm((current) => ({ ...current, rating }))
                }
              />
            </div>
          </div>
        </FormSection>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <BaseButton variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </BaseButton>
          <BaseButton type="submit" disabled={saving}>
            <Save size={17} />{" "}
            {saving ? "Saving..." : editingDive ? "Update dive" : "Save dive"}
          </BaseButton>
        </div>
      </form>
    </div>
  );
}
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="form-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
