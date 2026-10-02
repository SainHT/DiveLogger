import { Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllPresets, getDefaultPreset } from '../../../storage/repositories/presetRepository';
import type { EquipmentPreset } from '../domain/preset.model';
import { BaseButton } from '../../../ui/components/common/BaseButton';
import { PresetManagerModal } from './PresetManagerModal';

export function PresetSelector({ onSelectPreset }: { onSelectPreset: (preset: EquipmentPreset) => void }) {
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [managing, setManaging] = useState(false);
  const refresh = async () => { const available = await getAllPresets(); setPresets(available); const defaultPreset = await getDefaultPreset(); if (defaultPreset) { setSelectedId(defaultPreset.id); onSelectPreset(defaultPreset); } };
  useEffect(() => { void refresh(); }, []);
  const select = (id: string) => { setSelectedId(id); const preset = presets.find((item) => item.id === id); if (preset) onSelectPreset(preset); };
  return <div className="preset-selector"><label className="field"><span className="field-label">Equipment preset</span><select value={selectedId} onChange={(event) => select(event.target.value)}><option value="">Choose a preset</option>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}{preset.isDefault ? ' (Default)' : ''}</option>)}</select></label><BaseButton type="button" variant="secondary" onClick={() => setManaging(true)}><Settings2 size={16} /> Manage presets</BaseButton>{managing && <PresetManagerModal onClose={() => setManaging(false)} onChanged={() => void refresh()} />}</div>;
}