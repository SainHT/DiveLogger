import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Save, Star } from 'lucide-react-native';
import type { DiveLog, RecreationalGas, WaterType } from '@scuba-log/shared/modules/dives/domain/dive.model';
import type { NewDiveLog } from '@scuba-log/shared/storage/repositories/diveRepository';
import { createDive, getAllDives, updateDive } from '@scuba-log/shared/storage/repositories/diveRepository';
import { getAllPresets } from '@scuba-log/shared/storage/repositories/presetRepository';
import type { EquipmentPreset, SuitType, TankType } from '@scuba-log/shared/modules/equipment/domain/preset.model';
import { calculateMOD } from '@scuba-log/shared/modules/physics/utils/gasCalculations';
import { colors, tokens } from '../styles/tokens';

type Form = {
  number: string; date: string; buddy: string; site: string; location: string; type: string;
  startTime: string; duration: string; endTime: string; max: string; avg: string; water: WaterType;
  start: string; end: string; gas: RecreationalGas; tankCapacity: string; tank: TankType;
  weight: string; suit: SuitType | ''; equipment: string; minTemp: string; avgTemp: string; maxTemp: string;
  weather: string; visibility: string; conditions: string; notes: string; rating: number;
};

const inputStyle = { color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: colors.background };
const suitTypes: SuitType[] = ['Shorty', '3mm', '5mm', '7mm', 'Semi-Dry', 'Drysuit'];
const tankTypes: TankType[] = ['Single', 'Doubles', 'Sidemount', 'Rebreather', 'Other'];
const waterTypes: WaterType[] = ['Salt', 'Fresh', 'Brackish'];
const gasTypes: RecreationalGas[] = ['AIR', 'EAN32', 'EAN36'];

const toForm = (dive?: DiveLog): Form => ({
  number: dive ? String(dive.diveNumber) : '', date: dive?.date ?? new Date().toISOString().slice(0, 10),
  buddy: dive?.buddy ?? '', site: dive?.siteName ?? '', location: dive?.location ?? '', type: dive?.diveType ?? '',
  startTime: dive?.diveStart ?? '', duration: dive ? String(Math.round(dive.duration / 60)) : '', endTime: dive?.diveEnd ?? '',
  max: dive ? String(dive.maxDepthMeters) : '', avg: dive?.avgDepthMeters == null ? '' : String(dive.avgDepthMeters),
  water: dive?.waterType ?? 'Salt', start: dive ? String(dive.startPressureBar) : '', end: dive ? String(dive.endPressureBar) : '',
  gas: dive?.gasMix ?? 'AIR', tankCapacity: dive?.tankCapacityLiters == null ? '' : String(dive.tankCapacityLiters),
  tank: dive?.tankType ?? 'Single', weight: dive ? String(dive.weightKg) : '', suit: dive?.suitType ?? '',
  equipment: dive?.specialEquipment ?? '', minTemp: dive?.minWaterTempCelsius == null ? '' : String(dive.minWaterTempCelsius),
  avgTemp: dive?.avgWaterTempCelsius == null ? '' : String(dive.avgWaterTempCelsius), maxTemp: dive?.maxWaterTempCelsius == null ? '' : String(dive.maxWaterTempCelsius),
  weather: dive?.weather ?? '', visibility: dive?.visibilityMeters == null ? '' : String(dive.visibilityMeters),
  conditions: dive?.specialConditions ?? '', notes: dive?.notes ?? '', rating: dive?.rating ?? 0,
});

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', flex = 1, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'numeric'; flex?: number; multiline?: boolean }) {
  return <View style={{ flex, gap: 5 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} multiline={multiline} numberOfLines={multiline ? 4 : 1} style={{ ...inputStyle, minHeight: multiline ? 85 : undefined, textAlignVertical: multiline ? 'top' : 'center' }} /></View>;
}

function Select({ label, value, options, onChange, flex = 1 }: { label: string; value: string; options: string[]; onChange: (value: string) => void; flex?: number }) {
  const [open, setOpen] = useState(false);
  return <View style={{ flex, gap: 5, zIndex: open ? 20 : 1, elevation: open ? 20 : 1 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><Pressable onPress={() => setOpen((current) => !current)} style={{ ...inputStyle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: colors.text, fontSize: 13 }}>{value || 'Select'}</Text><Text style={{ color: colors.muted }}>{open ? '▴' : '▾'}</Text></Pressable>{open && <View style={{ position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 4, zIndex: 30, elevation: 30 }}>{options.map((option) => <Pressable key={option} onPress={() => { onChange(option); setOpen(false); }} style={{ padding: 10 }}><Text style={{ color: option === value ? colors.accent : colors.text, fontSize: 13 }}>{option}</Text></Pressable>)}</View>}</View>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ ...tokens.card, gap: 12, zIndex: 1 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>{children}</View>;
}

export function EntryScreen({ dive, onSaved, onCancel }: { dive?: DiveLog; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(() => toForm(dive));
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    setForm(toForm(dive));
    void getAllPresets().then(setPresets);
    if (!dive) {
      void getAllDives().then((dives) => {
        const latestNumber = dives.reduce((max, item) => Math.max(max, item.diveNumber), 0);
        setForm((current) => current.number ? current : { ...current, number: String(latestNumber + 1) });
      });
    }
  }, [dive]);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));
  const number = (value: string) => value === '' ? undefined : Number(value);
  const mod = calculateMOD(form.gas === 'AIR' ? 0.21 : form.gas === 'EAN32' ? 0.32 : 0.36);

  const save = async () => {
    const required: Array<[string, string]> = [['Dive number', form.number], ['Date', form.date], ['Location', form.location], ['Site name', form.site], ['Dive type', form.type], ['Duration', form.duration], ['Max depth', form.max], ['Gas mix', form.gas], ['Start pressure', form.start], ['End pressure', form.end], ['Tank type', form.tank], ['Weight', form.weight]];
    const missing = required.find(([, value]) => !value.trim());
    if (missing) { setError(`${missing[0]} is required.`); return; }
    const numeric = [['Dive number', form.number], ['Duration', form.duration], ['Max depth', form.max], ['Start pressure', form.start], ['End pressure', form.end], ['Weight', form.weight]];
    if (numeric.some(([, value]) => !Number.isFinite(Number(value)))) { setError('Numeric fields must contain valid numbers.'); return; }
    const data: NewDiveLog = {
      diveNumber: Number(form.number), date: form.date.trim(), waterType: form.water, location: form.location.trim(), siteName: form.site.trim(), diveType: form.type.trim(),
      diveStart: form.startTime || undefined, diveEnd: form.endTime || undefined, duration: Number(form.duration) * 60, maxDepthMeters: Number(form.max), avgDepthMeters: form.avg ? Number(form.avg) : undefined,
      gasMix: form.gas, startPressureBar: Number(form.start), endPressureBar: Number(form.end), tankCapacityLiters: number(form.tankCapacity), tankType: form.tank,
      weightKg: Number(form.weight), suitType: form.suit || undefined, specialEquipment: form.equipment || undefined, minWaterTempCelsius: number(form.minTemp), avgWaterTempCelsius: number(form.avgTemp), maxWaterTempCelsius: number(form.maxTemp),
      weather: form.weather || undefined, visibilityMeters: number(form.visibility), specialConditions: form.conditions || undefined, notes: form.notes || undefined, rating: form.rating || undefined,
    };
    if (dive) await updateDive(dive.id, data); else await createDive(data);
    onSaved();
  };

  const applyPreset = (id: string) => {
    const preset = presets.find((item) => item.id === id);
    if (preset) setForm((current) => ({ ...current, weight: preset.weightKg == null ? current.weight : String(preset.weightKg), tankCapacity: preset.tankCapacityLiters == null ? current.tankCapacity : String(preset.tankCapacityLiters), tank: preset.tankType ?? current.tank, suit: preset.suitType ?? current.suit, equipment: preset.specialEquipment ?? current.equipment }));
  };

  return <ScrollView style={tokens.screen} contentContainerStyle={tokens.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={onCancel} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} color={colors.accent} /><Text style={{ color: colors.accent, fontWeight: '700' }}>Back</Text></Pressable>
    <View style={{ gap: 6 }}><Text style={{ color: colors.muted, fontSize: 11, fontFamily: 'monospace' }}>LOGBOOK / DIVE ENTRY</Text><Text style={tokens.heading}>{dive ? 'Edit dive.' : 'New dive.'}</Text><Text style={tokens.body}>Capture the essentials from the boat or shore.</Text></View>
    <Card title="General information"><View style={{ flexDirection: 'row', gap: 9 }}><Field label="Dive number *" placeholder="e.g. 42" value={form.number} onChangeText={(value) => set('number', value)} keyboardType="numeric" /><Field label="Dive date *" placeholder="YYYY-MM-DD" value={form.date} onChangeText={(value) => set('date', value)} /></View><Field label="Buddy name" placeholder="e.g. John Diver" value={form.buddy} onChangeText={(value) => set('buddy', value)} /><Field label="Site name *" placeholder="e.g. Blue Hole" value={form.site} onChangeText={(value) => set('site', value)} /><Field label="Location *" placeholder="e.g. Dahab, Egypt" value={form.location} onChangeText={(value) => set('location', value)} /><Field label="Dive type *" placeholder="e.g. Reef, Wreck, Cave" value={form.type} onChangeText={(value) => set('type', value)} /></Card>
    <Card title="Depths, duration and gas"><Field label="Dive start time" placeholder="HH:mm" value={form.startTime} onChangeText={(value) => set('startTime', value)} /><Field label="Duration (min) *" placeholder="e.g. 31" value={form.duration} onChangeText={(value) => set('duration', value)} keyboardType="numeric" /><Field label="Dive end time" placeholder="HH:mm" value={form.endTime} onChangeText={(value) => set('endTime', value)} /><View style={{ flexDirection: 'row', gap: 9 }}><Field label="Max depth (m) *" placeholder="e.g. 30" value={form.max} onChangeText={(value) => set('max', value)} keyboardType="numeric" /><Field label="Average depth (m)" placeholder="e.g. 18" value={form.avg} onChangeText={(value) => set('avg', value)} keyboardType="numeric" /></View><Select label="Water type" value={form.water} options={waterTypes} onChange={(value) => set('water', value as WaterType)} /><View style={{ flexDirection: 'row', gap: 9 }}><Field label="Start pressure (bar) *" placeholder="e.g. 200" value={form.start} onChangeText={(value) => set('start', value)} keyboardType="numeric" /><Field label="End pressure (bar) *" placeholder="e.g. 50" value={form.end} onChangeText={(value) => set('end', value)} keyboardType="numeric" /></View><Select label="Gas mix *" value={form.gas} options={gasTypes} onChange={(value) => set('gas', value as RecreationalGas)} /><Text style={{ color: colors.accent, fontSize: 12 }}>Recommended MOD: {mod.toFixed(1)} m</Text><View style={{ flexDirection: 'row', gap: 9 }}><Field label="Tank capacity (L)" placeholder="e.g. 12" value={form.tankCapacity} onChangeText={(value) => set('tankCapacity', value)} keyboardType="numeric" /><Select label="Tank type *" value={form.tank} options={tankTypes} onChange={(value) => set('tank', value as TankType)} /></View></Card>
    <Card title="Gear and environment"><Select label="Equipment preset" value="" options={presets.map((preset) => preset.name)} onChange={(name) => { const preset = presets.find((item) => item.name === name); if (preset) applyPreset(preset.id); }} /><View style={{ flexDirection: 'row', gap: 9 }}><Field label="Weight (kg) *" placeholder="e.g. 6" value={form.weight} onChangeText={(value) => set('weight', value)} keyboardType="numeric" /><Select label="Suit type" value={form.suit} options={suitTypes} onChange={(value) => set('suit', value as SuitType)} /></View><Field label="Special equipment" placeholder="e.g. DSMB, camera" value={form.equipment} onChangeText={(value) => set('equipment', value)} /><View style={{ flexDirection: 'row', gap: 7 }}><Field label="Min temp (°C)" placeholder="e.g. 18" value={form.minTemp} onChangeText={(value) => set('minTemp', value)} keyboardType="numeric" /><Field label="Avg temp (°C)" placeholder="e.g. 23" value={form.avgTemp} onChangeText={(value) => set('avgTemp', value)} keyboardType="numeric" /><Field label="Max temp (°C)" placeholder="e.g. 28" value={form.maxTemp} onChangeText={(value) => set('maxTemp', value)} keyboardType="numeric" /></View><View style={{ flexDirection: 'row', gap: 9 }}><Field label="Weather" placeholder="e.g. Sunny" value={form.weather} onChangeText={(value) => set('weather', value)} flex={2} /><Field label="Visibility (m)" placeholder="e.g. 30" value={form.visibility} onChangeText={(value) => set('visibility', value)} flex={1} keyboardType="numeric" /></View><Field label="Special conditions" placeholder="e.g. Mild current" value={form.conditions} onChangeText={(value) => set('conditions', value)} /></Card>
    <Card title="Notes and rating"><Field label="Personal notes" placeholder="Add notes about this dive" value={form.notes} onChangeText={(value) => set('notes', value)} multiline /><View style={{ gap: 6 }}><Text style={{ color: colors.muted, fontSize: 12 }}>Rating</Text><View style={{ flexDirection: 'row', gap: 8 }}>{[1, 2, 3, 4, 5].map((star) => <Pressable key={star} onPress={() => set('rating', star)}><Star size={25} color={star <= form.rating ? '#facc15' : colors.muted} fill={star <= form.rating ? '#facc15' : 'transparent'} /></Pressable>)}</View></View></Card>
    {error && <Text style={{ color: '#fbbf24', fontSize: 12 }}>{error}</Text>}
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 9 }}><Pressable onPress={onCancel} style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 12 }}><Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text></Pressable><Pressable onPress={() => void save()} style={{ backgroundColor: colors.accent, borderRadius: 4, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Save size={16} color={colors.background} /><Text style={{ color: colors.background, fontWeight: '800' }}>Save dive</Text></Pressable></View>
  </ScrollView>;
}
