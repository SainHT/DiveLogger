import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Check, Edit3, Plus, Save, Star, Trash2, X } from 'lucide-react-native';
import type { EquipmentPreset, SuitType, TankType } from '@scuba-log/shared/modules/equipment/domain/preset.model';
import { deletePreset, getAllPresets, savePreset } from '@scuba-log/shared/storage/repositories/presetRepository';
import { colors, tokens } from '../styles/tokens';

const suitTypes: SuitType[] = ['Shorty', '3mm', '5mm', '7mm', 'Semi-Dry', 'Drysuit'];
const tankTypes: TankType[] = ['Single', 'Doubles', 'Sidemount', 'Rebreather', 'Other'];
const inputStyle = { color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: colors.background };

function SelectField({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string | undefined) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 5, zIndex: open ? 10 : 1, elevation: open ? 10 : 1 }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Pressable onPress={() => setOpen((current) => !current)} style={{ ...inputStyle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: value ? colors.text : colors.muted, fontSize: 13 }}>{value ?? 'Not specified'}</Text>
        <Text style={{ color: colors.muted }}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open && <View style={{ position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 4, zIndex: 20, elevation: 20 }}>
        <Pressable onPress={() => { onChange(undefined); setOpen(false); }} style={{ padding: 10 }}><Text style={{ color: colors.muted, fontSize: 13 }}>Not specified</Text></Pressable>
        {options.map((option) => <Pressable key={option} onPress={() => { onChange(option); setOpen(false); }} style={{ padding: 10 }}><Text style={{ color: option === value ? colors.accent : colors.text, fontSize: 13 }}>{option}</Text></Pressable>)}
      </View>}
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'numeric' }) {
  return <View style={{ gap: 5 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} style={inputStyle} /></View>;
}

function PresetFormModal({ preset, visible, onClose, onSaved }: { preset?: EquipmentPreset; visible: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<EquipmentPreset>(() => ({
    id: preset?.id ?? `preset-${Date.now()}`,
    name: preset?.name ?? '',
    isDefault: preset?.isDefault ?? false,
    suitType: preset?.suitType,
    suitSize: preset?.suitSize ?? '',
    bootSize: preset?.bootSize ?? '',
    weightKg: preset?.weightKg,
    tankCapacityLiters: preset?.tankCapacityLiters,
    tankType: preset?.tankType,
    specialEquipment: preset?.specialEquipment ?? '',
    updatedAt: preset?.updatedAt ?? Date.now(),
  }));
  const [error, setError] = useState('');
  const set = <K extends keyof EquipmentPreset>(key: K, value: EquipmentPreset[K]) => setForm((current) => ({ ...current, [key]: value }));
  const numberValue = (value: string) => value === '' ? undefined : Number(value);

  const submit = async () => {
    if (!form.name.trim()) {
      setError('Preset name is required.');
      return;
    }
    const hasEquipmentData = Boolean(
      form.suitType ||
      form.suitSize?.trim() ||
      form.bootSize?.trim() ||
      (form.weightKg != null && !Number.isNaN(form.weightKg)) ||
      (form.tankCapacityLiters != null && !Number.isNaN(form.tankCapacityLiters)) ||
      form.tankType ||
      form.specialEquipment?.trim(),
    );
    if (!hasEquipmentData) {
      setError('Please fill in at least one equipment field before saving this preset.');
      return;
    }
    await savePreset({ ...form, name: form.name.trim() });
    onSaved();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#020617cc', justifyContent: 'center', padding: 16 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 16, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ gap: 5 }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, fontFamily: 'monospace' }}>EQUIPMENT / PRESET</Text><Text style={{ color: colors.text, fontSize: 21, fontWeight: '800' }}>{preset ? 'Edit preset' : 'Create preset'}</Text></View>
              <Pressable onPress={onClose} hitSlop={8}><X size={19} color={colors.muted} /></Pressable>
            </View>
            <Field label="Name" placeholder="e.g. Tropical setup" value={form.name} onChangeText={(value) => set('name', value)} />
            <View style={{ flexDirection: 'row', gap: 9 }}><View style={{ flex: 1 }}><Field label="Suit size" placeholder="e.g. L" value={form.suitSize ?? ''} onChangeText={(value) => set('suitSize', value)} /></View><View style={{ flex: 1 }}><Field label="Boot size" placeholder="e.g. 43 EU" value={form.bootSize ?? ''} onChangeText={(value) => set('bootSize', value)} /></View></View>
            <View style={{ flexDirection: 'row', gap: 9 }}><View style={{ flex: 1 }}><Field label="Weight (kg)" placeholder="e.g. 8" value={form.weightKg?.toString() ?? ''} onChangeText={(value) => set('weightKg', numberValue(value))} keyboardType="numeric" /></View><View style={{ flex: 1 }}><Field label="Tank capacity (L)" placeholder="e.g. 15" value={form.tankCapacityLiters?.toString() ?? ''} onChangeText={(value) => set('tankCapacityLiters', numberValue(value))} keyboardType="numeric" /></View></View>
            <View style={{ flexDirection: 'row', gap: 9 }}><View style={{ flex: 1 }}><SelectField label="Suit type" value={form.suitType} options={suitTypes} onChange={(value) => set('suitType', value as SuitType | undefined)} /></View><View style={{ flex: 1 }}><SelectField label="Tank type" value={form.tankType} options={tankTypes} onChange={(value) => set('tankType', value as TankType | undefined)} /></View></View>
            <View style={{ gap: 5 }}><Text style={{ color: colors.muted, fontSize: 12 }}>Special equipment</Text><TextInput multiline numberOfLines={3} value={form.specialEquipment} onChangeText={(value) => set('specialEquipment', value)} placeholder="e.g. DSMB, camera" placeholderTextColor={colors.muted} style={{ ...inputStyle, minHeight: 72, textAlignVertical: 'top' }} /></View>
            <Pressable onPress={() => set('isDefault', !form.isDefault)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 19, height: 19, borderColor: form.isDefault ? colors.accent : colors.muted, borderWidth: 1, borderRadius: 3, backgroundColor: form.isDefault ? colors.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{form.isDefault && <Check size={14} color={colors.background} />}</View><Text style={{ color: colors.text, fontSize: 13 }}>Use as default for new dives</Text></Pressable>
            {error && <Text style={{ color: '#fbbf24', fontSize: 12 }}>{error}</Text>}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 9 }}><Pressable onPress={onClose} style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 10 }}><Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text></Pressable><Pressable onPress={() => void submit()} style={{ backgroundColor: colors.accent, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Save size={15} color={colors.background} /><Text style={{ color: colors.background, fontWeight: '800' }}>Save preset</Text></Pressable></View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export function PresetsScreen({ onBack }: { onBack: () => void }) {
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [editing, setEditing] = useState<EquipmentPreset>();
  const [creating, setCreating] = useState(false);
  const refresh = async () => setPresets(await getAllPresets());
  useEffect(() => { void refresh(); }, []);
  const remove = (preset: EquipmentPreset) => Alert.alert('Delete preset?', `Delete "${preset.name}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void deletePreset(preset.id).then(refresh) }]);
  const makeDefault = async (preset: EquipmentPreset) => { await savePreset({ ...preset, isDefault: true }); await refresh(); };

  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <Pressable onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} color={colors.accent} /><Text style={{ color: colors.accent, fontWeight: '700' }}>Back to Logbook</Text></Pressable>
      <View style={{ gap: 6 }}><Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, fontFamily: 'monospace' }}>EQUIPMENT / LIBRARY</Text><Text style={tokens.heading}>Equipment presets.</Text><Text style={tokens.body}>Keep frequently used gear ready for your next dive.</Text></View>
      <Pressable onPress={() => setCreating(true)} style={{ backgroundColor: colors.accent, borderRadius: 6, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }}><Plus size={17} color={colors.background} /><Text style={{ color: colors.background, fontWeight: '800' }}>Create preset</Text></Pressable>
      <View style={{ gap: 10 }}>{presets.map((preset) => <View key={preset.id} style={{ ...tokens.card, gap: 10 }}>
        <View><Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{preset.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{preset.suitType ?? 'No suit'}{preset.weightKg !== undefined ? ` / ${preset.weightKg} kg` : ''}{preset.tankCapacityLiters !== undefined ? ` / ${preset.tankCapacityLiters} L tank` : ''}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {preset.isDefault ? <View style={{ backgroundColor: '#083344', borderColor: '#155e75', borderWidth: 1, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={12} color={colors.accent} fill={colors.accent} /><Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>Default</Text></View> : <Pressable onPress={() => void makeDefault(preset)}><Text style={{ color: colors.muted, fontSize: 12 }}>Set default</Text></Pressable>}
          <Pressable onPress={() => setEditing(preset)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Edit3 size={14} color={colors.accent} /><Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>Edit</Text></Pressable>
          <Pressable onPress={() => remove(preset)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Trash2 size={14} color="#94a3b8" /><Text style={{ color: '#94a3b8', fontSize: 12 }}>Delete</Text></Pressable>
        </View>
      </View>)}{presets.length === 0 && <View style={tokens.card}><Text style={tokens.body}>No equipment presets saved yet.</Text></View>}</View>
      <PresetFormModal visible={creating || editing !== undefined} preset={editing} onClose={() => { setCreating(false); setEditing(undefined); }} onSaved={() => { setCreating(false); setEditing(undefined); void refresh(); }} />
    </ScrollView>
  );
}
