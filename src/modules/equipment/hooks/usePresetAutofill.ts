import type { DiveLog } from '../../dives/domain/dive.model';
import type { EquipmentPreset } from '../domain/preset.model';

export function applyPresetToDiveForm(
  currentFormData: Partial<DiveLog>,
  preset: EquipmentPreset,
): Partial<DiveLog> {
  const updated = { ...currentFormData };

  if (preset.weightKg !== undefined) updated.weightKg = preset.weightKg;
  if (preset.suitType !== undefined) updated.suitType = preset.suitType;
  if (preset.tankCapacityLiters !== undefined) updated.tankCapacityLiters = preset.tankCapacityLiters;
  if (preset.tankType !== undefined) updated.tankType = preset.tankType;
  if (preset.specialEquipment !== undefined) updated.specialEquipment = preset.specialEquipment;

  return updated;
}