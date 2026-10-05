import { ArrowLeft, Edit3, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deletePreset, getAllPresets, savePreset } from '../../storage/repositories/presetRepository';
import type { EquipmentPreset } from '../../modules/equipment/domain/preset.model';
import { BaseButton } from '../components/common/BaseButton';
import { PresetFormModal } from '../../modules/equipment/components/PresetFormModal';

export function PresetsView({ onBack }: { onBack: () => void }) {
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [editing, setEditing] = useState<EquipmentPreset>();
  const [creating, setCreating] = useState(false);
  const refresh = () => { void getAllPresets().then(setPresets); };
  useEffect(refresh, []);
  const remove = async (preset: EquipmentPreset) => { if (window.confirm(`Delete "${preset.name}"?`)) { await deletePreset(preset.id); refresh(); } };
  const makeDefault = async (preset: EquipmentPreset) => { await savePreset({ ...preset, isDefault: true }); refresh(); };
  return <div className="page-stack"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to Logbook</button><section className="page-heading"><div><span className="eyebrow">EQUIPMENT / LIBRARY</span><h1>Equipment presets.</h1><p className="muted">Keep frequently used gear ready for your next dive.</p></div><BaseButton onClick={() => setCreating(true)}><Plus size={16} /> Create preset</BaseButton></section><section className="preset-list">{presets.map((preset) => <article className="preset-row" key={preset.id}><div><strong>{preset.name}</strong><div className="preset-meta">{preset.suitType ?? 'No suit'}{preset.weightKg !== undefined ? ` / ${preset.weightKg} kg` : ''}{preset.tankCapacityLiters !== undefined ? ` / ${preset.tankCapacityLiters} L tank` : ''}</div></div><div className="preset-row-actions">{preset.isDefault && <span className="badge"><Star size={12} /> Default</span>}<button className="text-button" onClick={() => setEditing(preset)}><Edit3 size={14} /> Edit</button>{!preset.isDefault && <button className="text-button" onClick={() => void makeDefault(preset)}>Set default</button>}<button className="text-button danger-text" onClick={() => void remove(preset)}><Trash2 size={14} /> Delete</button></div></article>)}{presets.length === 0 && <div className="empty-state">No equipment presets saved yet.</div>}</section>{(creating || editing) && <PresetFormModal preset={editing} onClose={() => { setCreating(false); setEditing(undefined); }} onSaved={() => { setCreating(false); setEditing(undefined); refresh(); }} />}</div>;
}
