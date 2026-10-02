import { Edit3, Plus, Star, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deletePreset, getAllPresets, savePreset } from '../../../storage/repositories/presetRepository';
import type { EquipmentPreset } from '../domain/preset.model';
import { BaseButton } from '../../../ui/components/common/BaseButton';
import { PresetFormModal } from './PresetFormModal';

export function PresetManagerModal({ onClose, onChanged }: { onClose: () => void; onChanged?: () => void }) {
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [editing, setEditing] = useState<EquipmentPreset | null>(null);
  const [creating, setCreating] = useState(false);
  const refresh = () => { void getAllPresets().then(setPresets); };
  useEffect(refresh, []);
  const saved = () => { setEditing(null); setCreating(false); refresh(); onChanged?.(); };
  const makeDefault = async (preset: EquipmentPreset) => { await savePreset({ ...preset, isDefault: true }); refresh(); onChanged?.(); };
  const remove = async (preset: EquipmentPreset) => { if (window.confirm(`Delete "${preset.name}"?`)) { await deletePreset(preset.id); refresh(); onChanged?.(); } };

  return <div className="modal-backdrop" role="presentation"><section className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="preset-manager-title"><div className="modal-heading"><div><span className="eyebrow">EQUIPMENT / LIBRARY</span><h2 id="preset-manager-title">Equipment presets</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="modal-toolbar"><p className="muted">Save the gear you use most often.</p><BaseButton onClick={() => setCreating(true)}><Plus size={16} /> Create new preset</BaseButton></div><div className="preset-list">{presets.map((preset) => <article className="preset-row" key={preset.id}><div><strong>{preset.name}</strong><div className="preset-meta">{preset.suitType ?? 'No suit'}{preset.weightKg !== undefined ? ` / ${preset.weightKg} kg` : ''}{preset.tankCapacityLiters !== undefined ? ` / ${preset.tankCapacityLiters} L tank` : ''}</div></div><div className="preset-row-actions">{preset.isDefault && <span className="badge"><Star size={12} /> Default</span>}<button className="text-button" onClick={() => setEditing(preset)}><Edit3 size={14} /> Edit</button>{!preset.isDefault && <button className="text-button" onClick={() => void makeDefault(preset)}>Set default</button>}<button className="text-button danger-text" onClick={() => void remove(preset)}><Trash2 size={14} /> Delete</button></div></article>)}{presets.length === 0 && <p className="empty-state">No equipment presets saved yet.</p>}</div>{(creating || editing) && <PresetFormModal preset={editing ?? undefined} onClose={() => { setCreating(false); setEditing(null); }} onSaved={saved} />}</section></div>;
}