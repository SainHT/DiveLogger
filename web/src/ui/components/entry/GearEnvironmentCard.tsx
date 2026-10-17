import { BaseInput } from "../common/BaseInput";
import { PresetSelector } from "../../../modules/equipment/components/PresetSelector";
import type { EquipmentPreset } from "@scuba-log/shared/modules/equipment/domain/preset.model";
import { FormSection, SelectField } from "./EntryFormPrimitives";
import type { FormState } from "../../hooks/useDiveEntry";

type Props = { form: FormState; set: (key: keyof FormState, value: string | undefined) => void; applyPreset: (preset: EquipmentPreset) => void; selectedPresetId: string | null; isCustom: boolean; saveAsPreset: boolean; setSaveAsPreset: (value: boolean) => void };
export function GearEnvironmentCard({ form, set, applyPreset, selectedPresetId, isCustom, saveAsPreset, setSaveAsPreset }: Props) {
  return <FormSection title="Gear and environment"><PresetSelector onSelectPreset={applyPreset} selectedPresetId={selectedPresetId} isCustom={isCustom} /><label className="checkbox-field"><input type="checkbox" checked={saveAsPreset} onChange={(e) => setSaveAsPreset(e.target.checked)} />{" "}Save these settings as a new preset</label><div className="form-grid mobile-layout">
    <BaseInput className="mobile-half" label="Weight (kg)" type="number" step="0.1" placeholder="e.g. 6" value={form.weightKg || ""} onChange={(e) => set("weightKg", e.target.value)} required />
    <SelectField className="mobile-half" label="Suit type" value={form.suitType || ""} options={["Shorty", "3mm", "5mm", "7mm", "Semi-Dry", "Drysuit"]} onChange={(value) => set("suitType", value)} />
    <BaseInput className="mobile-full" label="Special equipment" placeholder="e.g. DSMB, camera" value={form.specialEquipment} onChange={(e) => set("specialEquipment", e.target.value)} />
    <BaseInput className="mobile-third" label="Min temp (°C)" type="number" step="0.1" placeholder="e.g. 22" value={form.minWaterTempCelsius ?? ""} onChange={(e) => set("minWaterTempCelsius", e.target.value)} />
    <BaseInput className="mobile-third" label="Avg temp (°C)" type="number" step="0.1" placeholder="e.g. 23" value={form.avgWaterTempCelsius ?? ""} onChange={(e) => set("avgWaterTempCelsius", e.target.value)} />
    <BaseInput className="mobile-third" label="Max temp (°C)" type="number" step="0.1" placeholder="e.g. 24" value={form.maxWaterTempCelsius ?? ""} onChange={(e) => set("maxWaterTempCelsius", e.target.value)} />
    <BaseInput className="mobile-two-thirds" label="Weather" placeholder="e.g. Sunny" value={form.weather} onChange={(e) => set("weather", e.target.value)} />
    <BaseInput className="mobile-third" label="Visibility (m)" type="number" step="0.1" placeholder="e.g. 20" value={form.visibilityMeters ?? ""} onChange={(e) => set("visibilityMeters", e.target.value)} />
    <BaseInput className="mobile-full" label="Special conditions" placeholder="e.g. Strong current" value={form.specialConditions} onChange={(e) => set("specialConditions", e.target.value)} />
  </div></FormSection>;
}
