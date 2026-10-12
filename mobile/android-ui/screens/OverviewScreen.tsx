import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowDown, Clock, Plus, Star, Thermometer, Waves } from 'lucide-react-native';
import type { DiveLog, RecreationalGas } from '@scuba-log/shared/modules/dives/domain/dive.model';
import { getAllDives } from '@scuba-log/shared/storage/repositories/diveRepository';
import { colors, tokens } from '../styles/tokens';

const duration = (seconds: number) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
const date = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

const gasStyles: Record<RecreationalGas, { color: string; backgroundColor: string; borderColor: string }> = {
  AIR: { color: colors.air, backgroundColor: '#083344', borderColor: '#155e75' },
  EAN32: { color: colors.nitrox, backgroundColor: '#022c22', borderColor: '#047857' },
  EAN36: { color: colors.nitrox, backgroundColor: '#022c22', borderColor: '#047857' },
};

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={{ flex: 1, minWidth: 0, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 9, gap: 7 }}>
      <View>{icon}</View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 10, fontFamily: 'monospace' }}>{label}</Text>
    </View>
  );
}

function GasBadge({ gas }: { gas: RecreationalGas }) {
  const style = gasStyles[gas];
  return (
    <View style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor, borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ color: style.color, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' }}>{gas}</Text>
    </View>
  );
}

function RatingStars({ rating }: { rating?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (rating ?? 0);
        return <Star key={star} size={14} color={filled ? colors.accent : colors.border} fill={filled ? colors.accent : 'transparent'} />;
      })}
    </View>
  );
}

type Props = { onNewDive: () => void; onLogbook: () => void };

export function OverviewScreen({ onNewDive, onLogbook }: Props) {
  const [dives, setDives] = useState<DiveLog[]>([]);
  useEffect(() => { void getAllDives().then(setDives); }, []);
  const bottomTime = dives.reduce((sum, dive) => sum + dive.duration, 0);
  const maxDepth = dives.reduce((max, dive) => Math.max(max, dive.maxDepthMeters), 0);
  const coldest = dives.reduce<number | undefined>((min, dive) => dive.minWaterTempCelsius == null ? min : min == null ? dive.minWaterTempCelsius : Math.min(min, dive.minWaterTempCelsius), undefined);

  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, fontFamily: 'monospace' }}>DIVE OPERATIONS / OVERVIEW</Text>
        <Text style={tokens.heading}>Good to see you, diver.</Text>
        <Text style={tokens.body}>Your local logbook at a glance.</Text>
      </View>

      <Pressable onPress={onNewDive} style={{ backgroundColor: colors.accent, borderRadius: 6, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <Plus size={18} color={colors.background} />
        <Text style={{ color: colors.background, fontWeight: '800' }}>Log New Dive</Text>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 7 }}>
        <MetricCard label="Total dives" value={`${dives.length}`} icon={<Waves size={18} color={colors.accent} />} />
        <MetricCard label="Bottom time" value={duration(bottomTime)} icon={<Clock size={18} color={colors.accent} />} />
        <MetricCard label="Max depth" value={`${maxDepth.toFixed(1)} m`} icon={<ArrowDown size={18} color={colors.accent} />} />
        <MetricCard label="Coldest temp" value={coldest == null ? '—' : `${coldest.toFixed(1)} °C`} icon={<Thermometer size={18} color={colors.accent} />} />
      </View>

      <View style={tokens.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <View style={{ gap: 5 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, fontFamily: 'monospace' }}>LOGBOOK / RECENT</Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Recent dives</Text>
          </View>
          <Pressable onPress={onLogbook} hitSlop={8}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>View all dives →</Text>
          </Pressable>
        </View>

        <View style={{ gap: 10 }}>
          {dives.slice(0, 3).map((dive) => (
            <View key={dive.id} style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 12, gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: '800' }}>{date(dive.date)}</Text>
                <Text style={{ color: colors.accent, fontWeight: '800' }}>{dive.maxDepthMeters.toFixed(1)} m</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.muted }}>{dive.siteName || dive.location || 'Unnamed site'}</Text>
                <Text style={{ color: colors.muted }}>{Math.round(dive.duration / 60)} min</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <GasBadge gas={dive.gasMix} />
                <RatingStars rating={dive.rating} />
              </View>
            </View>
          ))}
          {dives.length === 0 && <Text style={tokens.body}>Your first dive is waiting to be logged.</Text>}
        </View>
      </View>
    </ScrollView>
  );
}
