import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ArrowDown, Clock, Plus, Thermometer, Waves } from 'lucide-react-native';
import type { DiveLog } from '@scuba-log/shared/modules/dives/domain/dive.model';
import { getAllDives } from '@scuba-log/shared/storage/repositories/diveRepository';
import { GasPresetChip } from '../components/GasPresetChip';
import { StatCard } from '../components/StatCard';
import { colors, tokens } from '../styles/tokens';

const duration = (seconds: number) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
const date = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));

export function OverviewScreen() {
  const [dives, setDives] = useState<DiveLog[]>([]);
  useEffect(() => { void getAllDives().then(setDives); }, []);
  const bottomTime = dives.reduce((sum, dive) => sum + dive.duration, 0);
  const maxDepth = dives.reduce((max, dive) => Math.max(max, dive.maxDepthMeters), 0);
  const coldest = dives.reduce<number | undefined>((min, dive) => dive.minWaterTempCelsius == null ? min : min == null ? dive.minWaterTempCelsius : Math.min(min, dive.minWaterTempCelsius), undefined);
  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <Text style={tokens.heading}>Good to see you, diver.</Text>
      <Text style={tokens.body}>Your local logbook at a glance.</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 10 }}>
          <StatCard label="Total dives" value={`${dives.length}`} icon={<Waves size={18} color={colors.accent} />} />
          <StatCard label="Max depth" value={`${maxDepth.toFixed(1)} m`} icon={<ArrowDown size={18} color={colors.accent} />} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <StatCard label="Bottom time" value={duration(bottomTime)} icon={<Clock size={18} color={colors.accent} />} />
          <StatCard label="Coldest temp" value={coldest == null ? '—' : `${coldest.toFixed(1)} °C`} icon={<Thermometer size={18} color={colors.accent} />} />
        </View>
      </View>
      <View style={tokens.card}>
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>LOGBOOK / RECENT</Text>
        <Text style={{ color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 12 }}>Recent dives</Text>
        {dives.slice(0, 3).map((dive) => (
          <View key={dive.id} style={{ borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View><Text style={{ color: colors.text, fontWeight: '700' }}>#{String(dive.diveNumber).padStart(3, '0')} · {date(dive.date)}</Text><Text style={tokens.body}>{dive.siteName || dive.location}</Text></View>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>{dive.maxDepthMeters.toFixed(1)} m</Text>
          </View>
        ))}
        {dives.length === 0 && <Text style={tokens.body}>Your first dive is waiting to be logged.</Text>}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Plus size={16} color={colors.accent} /><Text style={{ color: colors.accent, fontWeight: '700' }}>Log a new dive from Logbook</Text></View>
    </ScrollView>
  );
}
