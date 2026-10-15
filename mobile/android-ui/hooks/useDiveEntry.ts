import { useEffect, useState } from "react";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type {
  DiveLog,
  RecreationalGas,
  WaterType,
} from "@scuba-log/shared/modules/dives/domain/dive.model";
import type {
  EquipmentPreset,
  SuitType,
  TankType,
} from "@scuba-log/shared/modules/equipment/domain/preset.model";
import { calculateMOD } from "@scuba-log/shared/modules/physics/utils/gasCalculations";
import {
  createDive,
  getAllDives,
  updateDive,
} from "@scuba-log/shared/storage/repositories/diveRepository";
import { getAllPresets } from "@scuba-log/shared/storage/repositories/presetRepository";
import type { NewDiveLog } from "@scuba-log/shared/storage/repositories/diveRepository";

export type Form = {
  number: string;
  date: string;
  buddy: string;
  site: string;
  location: string;
  type: string;
  startTime: string;
  duration: string;
  endTime: string;
  max: string;
  avg: string;
  water: WaterType;
  start: string;
  end: string;
  gas: RecreationalGas;
  tankCapacity: string;
  tank: TankType;
  weight: string;
  suit: SuitType | "";
  equipment: string;
  minTemp: string;
  avgTemp: string;
  maxTemp: string;
  weather: string;
  visibility: string;
  conditions: string;
  notes: string;
  rating: number;
};

export type FormKey = keyof Form;
export type SetForm = <K extends FormKey>(key: K, value: Form[K]) => void;
export type TimeKey = "startTime" | "duration" | "endTime";

export const suitTypes: SuitType[] = [
  "Shorty",
  "3mm",
  "5mm",
  "7mm",
  "Semi-Dry",
  "Drysuit",
];
export const tankTypes: TankType[] = [
  "Single",
  "Doubles",
  "Sidemount",
  "Rebreather",
  "Other",
];
export const waterTypes: WaterType[] = ["Salt", "Fresh", "Brackish"];
export const gasTypes: RecreationalGas[] = ["AIR", "EAN32", "EAN36"];

export const parseTime = (value: string): number | undefined => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : undefined;
};

export const formatTime = (value: Date): string =>
  `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
export const formatDate = (value: Date): string =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
export const dateValue = (value: string): Date => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};
export const timeValue = (value: string): Date => {
  const result = new Date();
  const minutes = parseTime(value);
  result.setHours(
    minutes == null ? 0 : Math.floor(minutes / 60),
    minutes == null ? 0 : minutes % 60,
    0,
    0,
  );
  return result;
};

export const toForm = (dive?: DiveLog): Form => ({
  number: dive ? String(dive.diveNumber) : "",
  date: dive?.date ?? new Date().toISOString().slice(0, 10),
  buddy: dive?.buddy ?? "",
  site: dive?.siteName ?? "",
  location: dive?.location ?? "",
  type: dive?.diveType ?? "",
  startTime: dive?.diveStart ?? "",
  duration: dive ? String(Math.round(dive.duration / 60)) : "",
  endTime: dive?.diveEnd ?? "",
  max: dive ? String(dive.maxDepthMeters) : "",
  avg: dive?.avgDepthMeters == null ? "" : String(dive.avgDepthMeters),
  water: dive?.waterType ?? "Salt",
  start: dive ? String(dive.startPressureBar) : "",
  end: dive ? String(dive.endPressureBar) : "",
  gas: dive?.gasMix ?? "AIR",
  tankCapacity:
    dive?.tankCapacityLiters == null ? "" : String(dive.tankCapacityLiters),
  tank: dive?.tankType ?? "Single",
  weight: dive ? String(dive.weightKg) : "",
  suit: dive?.suitType ?? "",
  equipment: dive?.specialEquipment ?? "",
  minTemp:
    dive?.minWaterTempCelsius == null ? "" : String(dive.minWaterTempCelsius),
  avgTemp:
    dive?.avgWaterTempCelsius == null ? "" : String(dive.avgWaterTempCelsius),
  maxTemp:
    dive?.maxWaterTempCelsius == null ? "" : String(dive.maxWaterTempCelsius),
  weather: dive?.weather ?? "",
  visibility:
    dive?.visibilityMeters == null ? "" : String(dive.visibilityMeters),
  conditions: dive?.specialConditions ?? "",
  notes: dive?.notes ?? "",
  rating: dive?.rating ?? 0,
});

export function useDiveEntry(
  dive: DiveLog | undefined,
  onSaved: () => void,
) {
  const [form, setForm] = useState<Form>(() => toForm(dive));
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [error, setError] = useState("");
  const [picker, setPicker] = useState<"date" | TimeKey | null>(null);

  useEffect(() => {
    setForm(toForm(dive));
    void getAllPresets().then(setPresets);
    if (!dive) {
      void getAllDives().then((dives) => {
        const latestNumber = dives.reduce(
          (max, item) => Math.max(max, item.diveNumber),
          0,
        );
        setForm((current) =>
          current.number
            ? current
            : { ...current, number: String(latestNumber + 1) },
        );
      });
    }
  }, [dive]);

  const set = <K extends FormKey>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setTime = (key: TimeKey, value: string) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      const start = parseTime(key === "startTime" ? value : current.startTime);
      const end = parseTime(key === "endTime" ? value : current.endTime);
      const durationValue =
        key === "duration" ? Number(value) : Number(current.duration);
      const duration =
        Number.isFinite(durationValue) && durationValue >= 0
          ? Math.round(durationValue)
          : undefined;
      if (key === "startTime" && start != null) {
        if (duration != null && current.duration !== "")
          next.endTime = `${String(Math.floor(((start + duration) % 1440) / 60)).padStart(2, "0")}:${String((start + duration) % 60).padStart(2, "0")}`;
        else if (end != null)
          next.duration = String((end - start + 1440) % 1440);
      } else if (key === "endTime" && end != null) {
        if (start != null) next.duration = String((end - start + 1440) % 1440);
        else if (duration != null && current.duration !== "") {
          const startValue = (end - duration + 1440 * 10) % 1440;
          next.startTime = `${String(Math.floor(startValue / 60)).padStart(2, "0")}:${String(startValue % 60).padStart(2, "0")}`;
        }
      } else if (key === "duration" && duration != null) {
        if (start != null) {
          const endValue = (start + duration) % 1440;
          next.endTime = `${String(Math.floor(endValue / 60)).padStart(2, "0")}:${String(endValue % 60).padStart(2, "0")}`;
        } else if (end != null) {
          const startValue = (end - duration + 1440 * 10) % 1440;
          next.startTime = `${String(Math.floor(startValue / 60)).padStart(2, "0")}:${String(startValue % 60).padStart(2, "0")}`;
        }
      }
      return next;
    });
  };

  const onPickerChange = (event: DateTimePickerEvent, value?: Date) => {
    if (event.type === "dismissed" || !value || !picker) {
      setPicker(null);
      return;
    }
    if (picker === "date") set("date", formatDate(value));
    else setTime(picker, formatTime(value));
    if (event.type === "set") setPicker(null);
  };

  const save = async () => {
    const required: Array<[string, string]> = [
      ["Dive number", form.number],
      ["Date", form.date],
      ["Location", form.location],
      ["Site name", form.site],
      ["Dive type", form.type],
      ["Duration", form.duration],
      ["Max depth", form.max],
      ["Gas mix", form.gas],
      ["Start pressure", form.start],
      ["End pressure", form.end],
      ["Tank type", form.tank],
      ["Weight", form.weight],
    ];
    const missing = required.find(([, value]) => !value.trim());
    if (missing) {
      setError(`${missing[0]} is required.`);
      return;
    }
    const numeric = [
      ["Dive number", form.number],
      ["Duration", form.duration],
      ["Max depth", form.max],
      ["Start pressure", form.start],
      ["End pressure", form.end],
      ["Weight", form.weight],
    ];
    if (numeric.some(([, value]) => !Number.isFinite(Number(value)))) {
      setError("Numeric fields must contain valid numbers.");
      return;
    }
    const number = (value: string) =>
      value === "" ? undefined : Number(value);
    const data: NewDiveLog = {
      diveNumber: Number(form.number),
      date: form.date.trim(),
      buddy: form.buddy.trim() || undefined,
      waterType: form.water,
      location: form.location.trim(),
      siteName: form.site.trim(),
      diveType: form.type.trim(),
      diveStart: form.startTime || undefined,
      diveEnd: form.endTime || undefined,
      duration: Number(form.duration) * 60,
      maxDepthMeters: Number(form.max),
      avgDepthMeters: form.avg ? Number(form.avg) : undefined,
      gasMix: form.gas,
      startPressureBar: Number(form.start),
      endPressureBar: Number(form.end),
      tankCapacityLiters: number(form.tankCapacity),
      tankType: form.tank,
      weightKg: Number(form.weight),
      suitType: form.suit || undefined,
      specialEquipment: form.equipment || undefined,
      minWaterTempCelsius: number(form.minTemp),
      avgWaterTempCelsius: number(form.avgTemp),
      maxWaterTempCelsius: number(form.maxTemp),
      weather: form.weather || undefined,
      visibilityMeters: number(form.visibility),
      specialConditions: form.conditions || undefined,
      notes: form.notes || undefined,
      rating: form.rating || undefined,
    };
    if (dive) await updateDive(dive.id, data);
    else await createDive(data);
    onSaved();
  };

  const applyPreset = (id: string) => {
    const preset = presets.find((item) => item.id === id);
    if (preset)
      setForm((current) => ({
        ...current,
        weight:
          preset.weightKg == null ? current.weight : String(preset.weightKg),
        tankCapacity:
          preset.tankCapacityLiters == null
            ? current.tankCapacity
            : String(preset.tankCapacityLiters),
        tank: preset.tankType ?? current.tank,
        suit: preset.suitType ?? current.suit,
        equipment: preset.specialEquipment ?? current.equipment,
      }));
  };

  const mod = calculateMOD(
    form.gas === "AIR" ? 0.21 : form.gas === "EAN32" ? 0.32 : 0.36,
  );
  return {
    form,
    presets,
    error,
    picker,
    set,
    setTime,
    setPicker,
    onPickerChange,
    save,
    applyPreset,
    mod,
  };
}
