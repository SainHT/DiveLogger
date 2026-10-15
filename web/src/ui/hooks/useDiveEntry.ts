import { useEffect, useState, type FormEvent } from "react";
import { applyPresetToDiveForm } from "../../modules/equipment/hooks/usePresetAutofill";
import type { DiveLog } from "@scuba-log/shared/modules/dives/domain/dive.model";
import { createDive, getAllDives, updateDive, type NewDiveLog } from "@scuba-log/shared/storage/repositories/diveRepository";
import { savePreset } from "@scuba-log/shared/storage/repositories/presetRepository";
import { calculateSAC } from "@scuba-log/shared/modules/physics/utils/gasCalculations";
import { addMinutes, minutesBetween } from "../../modules/dives/utils/diveEntry";

export type FormState = Omit<NewDiveLog, "diveNumber" | "duration"> & {
  diveNumber: number;
  duration: number;
  diveStart: string;
  diveEnd: string;
};

const initial: FormState = {
  diveNumber: 1,
  date: new Date().toISOString().slice(0, 10),
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
  "diveNumber", "duration", "maxDepthMeters", "avgDepthMeters",
  "startPressureBar", "endPressureBar", "tankCapacityLiters", "weightKg",
  "maxWaterTempCelsius", "minWaterTempCelsius", "avgWaterTempCelsius",
  "visibilityMeters",
] as const;

function fromDive(dive: DiveLog): FormState {
  return {
    ...initial,
    ...dive,
    duration: Math.round(dive.duration / 60),
    diveStart:
      dive.diveStart ??
      (dive.startTime == null ? "" : `${String(Math.floor(dive.startTime / 60)).padStart(2, "0")}:${String(dive.startTime % 60).padStart(2, "0")}`),
    diveEnd:
      dive.diveEnd ??
      (dive.endTime == null ? "" : `${String(Math.floor(dive.endTime / 60)).padStart(2, "0")}:${String(dive.endTime % 60).padStart(2, "0")}`),
  };
}

export function useDiveEntry(nextNumber: number, editingDive?: DiveLog) {
  const [form, setForm] = useState<FormState>(() =>
    editingDive ? fromDive(editingDive) : { ...initial, diveNumber: nextNumber },
  );
  const [saving, setSaving] = useState(false);
  const [saveAsPreset, setSaveAsPreset] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingDive) {
      void getAllDives().then((dives) => {
        const highest = dives.reduce((max, dive) => Math.max(max, dive.diveNumber), 0);
        setForm((current) => ({ ...current, diveNumber: Math.max(nextNumber, highest + 1) }));
      });
    }
  }, [editingDive, nextNumber]);

  const set = (key: keyof FormState, raw: string | undefined) => {
    setForm((current) => ({
      ...current,
      [key]: numeric.includes(key as (typeof numeric)[number])
        ? raw == null || raw === "" ? undefined : Number(raw)
        : raw,
    }));
  };

  const setTime = (key: "diveStart" | "diveEnd" | "duration", raw: string) => {
    setForm((current) => {
      const next = { ...current, [key]: key === "duration" ? Number(raw) : raw };
      if ((key === "duration" || key === "diveStart") && next.diveStart && next.duration)
        next.diveEnd = addMinutes(next.diveStart, next.duration);
      else if (key === "diveEnd" && next.diveEnd && next.diveStart)
        next.duration = minutesBetween(next.diveStart, next.diveEnd);
      return next;
    });
  };

  const applyPreset = (preset: Parameters<typeof applyPresetToDiveForm>[1]) =>
    setForm((current) => ({ ...current, ...applyPresetToDiveForm(current, preset) }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { diveStart, diveEnd, duration, id: _id, updatedAt: _updatedAt,
        isSynced: _isSynced, isDeleted: _isDeleted, ...rest } = form as FormState &
        Partial<Pick<DiveLog, "id" | "updatedAt" | "isSynced" | "isDeleted">>;
      const data = { ...rest, date: form.date.slice(0, 10), duration: duration * 60, diveStart, diveEnd };
      if (saveAsPreset) {
        const name = window.prompt("Name this equipment preset");
        if (name?.trim()) await savePreset({
          id: crypto.randomUUID(), name: name.trim(), suitType: form.suitType,
          weightKg: form.weightKg, tankCapacityLiters: form.tankCapacityLiters,
          tankType: form.tankType, specialEquipment: form.specialEquipment, updatedAt: Date.now(),
        });
      }
      if (editingDive) await updateDive(editingDive.id, data);
      else await createDive(data);
    } catch {
      setError("Unable to save this dive locally. Please try again.");
      setSaving(false);
      return false;
    }
    return true;
  };

  const fO2 = form.gasMix === "AIR" ? 0.21 : form.gasMix === "EAN32" ? 0.32 : 0.36;
  const consumption = calculateSAC({
    startPressureBar: form.startPressureBar, endPressureBar: form.endPressureBar,
    durationMinutes: form.duration, avgDepthMeters: form.avgDepthMeters ?? form.maxDepthMeters,
    tankCapacityLiters: form.tankCapacityLiters,
  });

  return {
    form, set, setTime, applyPreset, submit, saving, saveAsPreset, setSaveAsPreset,
    error, consumption, mod: ((1.4 / fO2) - 1) * 10,
    setRating: (rating: number) => setForm((current) => ({ ...current, rating })),
  };
}
