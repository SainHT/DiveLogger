import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Plus, Settings2, Star } from 'lucide-react-native';
import type { DiveLog } from '@scuba-log/shared/modules/dives/domain/dive.model';
import { getAllDives } from '@scuba-log/shared/storage/repositories/diveRepository';
import { colors, tokens } from '../styles/tokens';

type Props = { onNewDive: () => void; onPresets: () => void };
const date = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export function LogbookScreen({ onNewDive, onPresets }: Props) {
  const [dives, setDives] = useState<DiveLog[]>([]);
  useEffect(() => { void getAllDives().then(setDives); }, []);
  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View><Text style={tokens.heading}>Logbook</Text><Text style={tokens.body}>{dives.length} recorded dives</Text></View>
        <Pressable onPress={onPresets} style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 4, padding: 9, flexDirection: 'row', gap: 6, alignItems: 'center' }}><Settings2 size={15} color={colors.accent} /><Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>Gear Presets</Text></Pressable>
      </View>
      <Pressable onPress={onNewDive} style={{ backgroundColor: colors.accent, borderRadius: 4, padding: 13, flexDirection: 'row', justifyContent: 'center', gap: 8 }}><Plus size={18} color={colors.background} /><Text style={{ color: colors.background, fontWeight: '800' }}>Log New Dive</Text></Pressable>
      {dives.map((dive) => <View key={dive.id} style={tokens.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>#{String(dive.diveNumber).padStart(3, '0')} · {date(dive.date)}</Text>
          <Text style={{ color: colors.accent, fontWeight: '800' }}>{dive.gasMix}</Text>
        </View>
        <Text style={{ color: colors.muted, marginTop: 7 }}>{dive.siteName || 'Unnamed site'}{dive.location ? ` · ${dive.location}` : ''}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}><Text style={{ color: colors.text }}>{dive.maxDepthMeters.toFixed(1)} m · {Math.round(dive.duration / 60)} min</Text><View style={{ flexDirection: 'row', gap: 2 }}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} color={star <= (dive.rating ?? 0) ? colors.accent : colors.border} fill={star <= (dive.rating ?? 0) ? colors.accent : 'transparent'} />)}</View></View>
      </View>)}
      {dives.length === 0 && <View style={tokens.card}><Text style={tokens.body}>No dives recorded yet.</Text></View>}
    </ScrollView>
  );
}
