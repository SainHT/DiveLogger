import type { EquipmentPreset } from '../../modules/equipment/domain/preset.model';
import { db } from '../db';

export function getAllPresets(): Promise<EquipmentPreset[]> {
  return db.presets.orderBy('name').toArray();
}

export function getPresetById(id: string): Promise<EquipmentPreset | undefined> {
  return db.presets.get(id);
}

export function getDefaultPreset(): Promise<EquipmentPreset | undefined> {
  return db.presets.filter((preset) => preset.isDefault === true).first();
}

export async function savePreset(preset: EquipmentPreset): Promise<string> {
  await db.transaction('rw', db.presets, async () => {
    if (preset.isDefault) {
      await db.presets.filter((current) => current.id !== preset.id).modify({ isDefault: false });
    }
    await db.presets.put({ ...preset, updatedAt: Date.now() });
  });
  return preset.id;
}

export function deletePreset(id: string): Promise<void> {
  return db.presets.delete(id);
}