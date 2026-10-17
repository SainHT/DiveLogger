import { useEffect, useState } from 'react';
import { getAllPresets, getDefaultPreset } from '@scuba-log/shared/storage/repositories/presetRepository';
import type { EquipmentPreset } from '@scuba-log/shared/modules/equipment/domain/preset.model';

const customValue = "__custom__";

export function PresetSelector({
  onSelectPreset,
  selectedPresetId,
  isCustom,
}: {
  onSelectPreset: (preset: EquipmentPreset) => void;
  selectedPresetId: string | null;
  isCustom: boolean;
}) {
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const refresh = async () => { const available = await getAllPresets(); setPresets(available); const defaultPreset = await getDefaultPreset(); if (defaultPreset) onSelectPreset(defaultPreset); };
  useEffect(() => { void refresh(); }, []);
  const select = (id: string) => { const preset = presets.find((item) => item.id === id); if (preset) onSelectPreset(preset); };
  const value = isCustom ? customValue : selectedPresetId ?? "";
  return <div className="preset-selector"><label className="field"><span className="field-label">Equipment preset</span><select className={isCustom ? "custom-preset" : undefined} value={value} onChange={(event) => select(event.target.value)}><option value="">Choose a preset</option>{isCustom && <option value={customValue}>Custom</option>}{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}{preset.isDefault ? ' (Default)' : ''}</option>)}</select></label></div>;
}