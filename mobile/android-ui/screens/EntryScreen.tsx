import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createDive } from '@scuba-log/shared/storage/repositories/diveRepository';
import type { NewDiveLog } from '@scuba-log/shared/storage/repositories/diveRepository';
import { colors, tokens } from '../styles/tokens';

const inputStyle = { color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: colors.surface };
const Field = ({ label, placeholder, value, onChangeText, flex = 1, keyboardType = 'default' }: { label: string; placeholder: string; value: string; onChangeText: (value: string) => void; flex?: number; keyboardType?: 'default' | 'numeric' }) => <View style={{ flex, gap: 5 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><TextInput style={inputStyle} placeholder={placeholder} placeholderTextColor={colors.muted} value={value} onChangeText={onChangeText} keyboardType={keyboardType} /></View>;

export function EntryScreen({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState({ number: '', date: '', water: 'Salt', max: '', avg: '', gas: 'AIR', start: '', end: '', weight: '', suit: '', equipment: '', weather: '', visibility: '', conditions: '' });
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    const dive: NewDiveLog = { diveNumber: Number(form.number) || 1, date: form.date || new Date().toISOString().slice(0, 10), waterType: form.water as NewDiveLog['waterType'], location: '', siteName: '', diveType: 'Recreational', duration: 0, maxDepthMeters: Number(form.max) || 0, avgDepthMeters: form.avg ? Number(form.avg) : undefined, gasMix: form.gas as NewDiveLog['gasMix'], startPressureBar: Number(form.start) || 0, endPressureBar: Number(form.end) || 0, tankType: 'Single', weightKg: Number(form.weight) || 0, suitType: form.suit ? form.suit as NewDiveLog['suitType'] : undefined, specialEquipment: form.equipment || undefined, weather: form.weather || undefined, visibilityMeters: form.visibility ? Number(form.visibility) : undefined, specialConditions: form.conditions || undefined };
    await createDive(dive);
    onSaved();
  };
  return <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}><Text style={tokens.heading}>New dive</Text><Text style={tokens.body}>Capture the essentials from the boat or shore.</Text>
    <View style={{ gap: 13 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}><Field label="Dive number" placeholder="e.g. 42" value={form.number} onChangeText={set('number')} keyboardType="numeric" /><Field label="Dive date" placeholder="YYYY-MM-DD" value={form.date} onChangeText={set('date')} /></View>
      <Field label="Water type" placeholder="Salt, Fresh, or Brackish" value={form.water} onChangeText={set('water')} />
      <View style={{ flexDirection: 'row', gap: 10 }}><Field label="Max depth (m)" placeholder="e.g. 30" value={form.max} onChangeText={set('max')} keyboardType="numeric" /><Field label="Avg depth (m)" placeholder="e.g. 18" value={form.avg} onChangeText={set('avg')} keyboardType="numeric" /></View>
      <Field label="Gas mix" placeholder="e.g. AIR or EAN32" value={form.gas} onChangeText={set('gas')} />
      <View style={{ flexDirection: 'row', gap: 10 }}><Field label="Start pressure (bar)" placeholder="e.g. 200" value={form.start} onChangeText={set('start')} keyboardType="numeric" /><Field label="End pressure (bar)" placeholder="e.g. 50" value={form.end} onChangeText={set('end')} keyboardType="numeric" /></View>
      <View style={{ flexDirection: 'row', gap: 10 }}><Field label="Weight (kg)" placeholder="e.g. 6" value={form.weight} onChangeText={set('weight')} keyboardType="numeric" /><Field label="Suit type" placeholder="e.g. 5mm" value={form.suit} onChangeText={set('suit')} /></View>
      <Field label="Special equipment" placeholder="e.g. DSMB, DPV, Camera" value={form.equipment} onChangeText={set('equipment')} />
      <View style={{ flexDirection: 'row', gap: 10 }}><Field label="Weather" placeholder="e.g. Sunny" value={form.weather} onChangeText={set('weather')} flex={1} /><Field label="Visibility (m)" placeholder="e.g. 20" value={form.visibility} onChangeText={set('visibility')} keyboardType="numeric" flex={2} /></View>
      <Field label="Special conditions" placeholder="e.g. Strong current, surge" value={form.conditions} onChangeText={set('conditions')} />
    </View>
    <Pressable onPress={() => void save()} style={{ backgroundColor: colors.accent, borderRadius: 4, padding: 14, alignItems: 'center', marginTop: 4 }}><Text style={{ color: colors.background, fontWeight: '800' }}>Save dive</Text></Pressable>
  </ScrollView>;
}
