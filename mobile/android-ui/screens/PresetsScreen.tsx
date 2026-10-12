import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowLeft, Star } from 'lucide-react-native';
import type { EquipmentPreset } from '@scuba-log/shared/modules/equipment/domain/preset.model';
import { getAllPresets } from '@scuba-log/shared/storage/repositories/presetRepository';
import { colors, tokens } from '../styles/tokens';

export function PresetsScreen({ onBack }: { onBack: () => void }) {
  const [presets, setPresets] = useState<EquipmentPreset[]>([]);
  useEffect(() => { void getAllPresets().then(setPresets); }, []);
  return <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
    <Pressable onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><ArrowLeft size={16} color={colors.accent} /><Text style={{ color: colors.accent, fontWeight: '700' }}>Back to Logbook</Text></Pressable>
    <Text style={tokens.heading}>Gear Presets</Text><Text style={tokens.body}>Keep frequently used gear ready for your next dive.</Text>
    {presets.map((preset) => <View key={preset.id} style={{ ...tokens.card, flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: colors.text, fontWeight: '800' }}>{preset.name}</Text><Text style={tokens.body}>{preset.suitType ?? 'No suit'}{preset.weightKg !== undefined ? ` · ${preset.weightKg} kg` : ''}</Text></View>{preset.isDefault && <Star size={16} color={colors.accent} fill={colors.accent} />}</View>)}
    {presets.length === 0 && <View style={tokens.card}><Text style={tokens.body}>No equipment presets saved yet.</Text></View>}
  </ScrollView>;
}
