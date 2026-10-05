import { useState, type FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { savePreset } from '../../../storage/repositories/presetRepository';
import type { EquipmentPreset, SuitType, TankType } from '../domain/preset.model';
import { BaseButton } from '../../../ui/components/common/BaseButton';
import { BaseInput } from '../../../ui/components/common/BaseInput';

const suitTypes: SuitType[] = ['Shorty', '3mm', '5mm', '7mm', 'Semi-Dry', 'Drysuit'];
const tankTypes: TankType[] = ['Single', 'Doubles', 'Sidemount', 'Rebreather', 'Other'];

export function PresetFormModal({ preset, onClose, onSaved }: { preset?: EquipmentPreset; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<EquipmentPreset>(() => ({ id: preset?.id ?? crypto.randomUUID(), name: preset?.name ?? '', isDefault: preset?.isDefault ?? false, suitType: preset?.suitType, suitSize: preset?.suitSize ?? '', bootSize: preset?.bootSize ?? '', weightKg: preset?.weightKg, tankCapacityLiters: preset?.tankCapacityLiters, tankType: preset?.tankType, specialEquipment: preset?.specialEquipment ?? '', updatedAt: preset?.updatedAt ?? Date.now() }));
  const [error, setError] = useState('');

  const set = (key: keyof EquipmentPreset, value: string | number | boolean | undefined) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) { setError('Preset name is required.'); return; }
    await savePreset({ ...form, name: form.name.trim() });
    onSaved();
  };

  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="preset-form-title">
    <div className="modal-heading"><div><span className="eyebrow">EQUIPMENT / PRESET</span><h2 id="preset-form-title">{preset ? 'Edit preset' : 'Create preset'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
    <form className="modal-form" onSubmit={submit}><div className="form-grid"><BaseInput label="Name" placeholder="e.g. Tropical setup" value={form.name} onChange={(event) => set('name', event.target.value)} required autoFocus /><BaseInput label="Suit size" placeholder="e.g. L" value={form.suitSize ?? ''} onChange={(event) => set('suitSize', event.target.value)} /><BaseInput label="Boot size" placeholder="e.g. 43 EU" value={form.bootSize ?? ''} onChange={(event) => set('bootSize', event.target.value)} /><BaseInput label="Weight (kg)" type="number" placeholder="e.g. 6" min="0" step="0.1" value={form.weightKg ?? ''} onChange={(event) => set('weightKg', event.target.value === '' ? undefined : Number(event.target.value))} /><BaseInput label="Tank capacity (L)" type="number" placeholder="e.g. 12" min="0" step="1" value={form.tankCapacityLiters ?? ''} onChange={(event) => set('tankCapacityLiters', event.target.value === '' ? undefined : Number(event.target.value))} /><label className="field"><span className="field-label">Suit type</span><select value={form.suitType ?? ''} onChange={(event) => set('suitType', (event.target.value || undefined) as SuitType | undefined)}><option value="">Not specified</option>{suitTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="field"><span className="field-label">Tank type</span><select value={form.tankType ?? ''} onChange={(event) => set('tankType', (event.target.value || undefined) as TankType | undefined)}><option value="">Not specified</option>{tankTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="field full-field"><span className="field-label">Special equipment</span><textarea rows={3} placeholder="e.g. DSMB, camera" value={form.specialEquipment ?? ''} onChange={(event) => set('specialEquipment', event.target.value)} /></label></div><label className="checkbox-field"><input type="checkbox" checked={form.isDefault === true} onChange={(event) => set('isDefault', event.target.checked)} /> Use as default for new dives</label>{error && <p className="form-error">{error}</p>}<div className="form-actions"><BaseButton type="button" variant="secondary" onClick={onClose}>Cancel</BaseButton><BaseButton type="submit"><Save size={16} /> Save preset</BaseButton></div></form>
  </section></div>;
}