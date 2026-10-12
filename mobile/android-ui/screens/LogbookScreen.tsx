import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Plus, Search, Settings2, SlidersHorizontal, Star } from 'lucide-react-native';
import type { DiveLog, RecreationalGas } from '@scuba-log/shared/modules/dives/domain/dive.model';
import { getAllDives } from '@scuba-log/shared/storage/repositories/diveRepository';
import { colors, tokens } from '../styles/tokens';

const date = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
const gasOptions = ['all', 'AIR', 'EAN32', 'EAN36', 'TRIMIX'];

const gasStyles: Record<string, { color: string; backgroundColor: string; borderColor: string }> = {
  AIR: { color: colors.air, backgroundColor: '#083344', borderColor: '#155e75' },
  EAN32: { color: colors.nitrox, backgroundColor: '#022c22', borderColor: '#047857' },
  EAN36: { color: colors.nitrox, backgroundColor: '#022c22', borderColor: '#047857' },
  TRIMIX: { color: colors.trimix, backgroundColor: '#500724', borderColor: '#9d174d' },
};

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1, zIndex: open ? 20 : 1, elevation: open ? 20 : 1 }}>
      <Pressable onPress={() => setOpen((current) => !current)} style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: colors.background, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text numberOfLines={1} style={{ color: value === 'all' ? colors.muted : colors.text, fontSize: 12 }}>{value === 'all' ? label : value}</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open && (
        <View style={{ position: 'absolute', top: 42, left: 0, right: 0, zIndex: 30, elevation: 30, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 4 }}>
          {options.map((option) => (
            <Pressable key={option} onPress={() => { onChange(option); setOpen(false); }} style={{ paddingHorizontal: 10, paddingVertical: 9 }}>
              <Text style={{ color: option === value ? colors.accent : colors.text, fontSize: 12 }}>{option === 'all' ? label : option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function GasBadge({ gas }: { gas: string }) {
  const style = gasStyles[gas] ?? gasStyles.AIR;
  return (
    <View style={{ backgroundColor: style.backgroundColor, borderColor: style.borderColor, borderWidth: 1, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ color: style.color, fontSize: 11, fontWeight: '800', fontFamily: 'monospace' }}>{gas}</Text>
    </View>
  );
}

function RatingStars({ rating }: { rating?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (rating ?? 0);
        return <Star key={star} size={15} color={filled ? '#facc15' : colors.muted} fill={filled ? '#facc15' : 'transparent'} />;
      })}
    </View>
  );
}

type Props = { onNewDive: () => void; onPresets: () => void; onDive: (dive: DiveLog) => void };

export function LogbookScreen({ onNewDive, onPresets, onDive }: Props) {
  const [dives, setDives] = useState<DiveLog[]>([]);
  const [query, setQuery] = useState('');
  const [gas, setGas] = useState('all');
  const [type, setType] = useState('all');

  useEffect(() => { void getAllDives().then(setDives); }, []);

  const types = useMemo(() => ['all', ...new Set(dives.map((dive) => dive.diveType))], [dives]);
  const filtered = useMemo(() => dives.filter((dive) => {
    const searchText = `${dive.siteName} ${dive.location}`.toLowerCase();
    return searchText.includes(query.toLowerCase()) && (gas === 'all' || dive.gasMix === gas) && (type === 'all' || dive.diveType === type);
  }), [dives, gas, query, type]);

  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, fontFamily: 'monospace' }}>LOGBOOK / ALL DIVES</Text>
        <Text style={tokens.heading}>Every descent, remembered.</Text>
        <Text style={tokens.body}>{filtered.length} of {dives.length} recorded dives</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={onPresets} style={{ flex: 1, backgroundColor: colors.surface, borderColor: '#334155', borderWidth: 1, borderRadius: 6, paddingVertical: 11, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <Settings2 size={16} color={colors.text} />
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>Gear Presets</Text>
        </Pressable>
        <Pressable onPress={onNewDive} style={{ flex: 1, backgroundColor: colors.accent, borderRadius: 6, paddingVertical: 11, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <Plus size={17} color={colors.background} />
          <Text style={{ color: colors.background, fontWeight: '800', fontSize: 12 }}>Log New Dive</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 12, gap: 11, zIndex: 10, elevation: 10 }}>
        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 4, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
          <Search size={17} color={colors.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search site or location" placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.text, fontSize: 13, paddingVertical: 10, paddingHorizontal: 8 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <SlidersHorizontal size={15} color={colors.muted} />
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700' }}>Filters</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, zIndex: 2 }}>
          <FilterSelect label="All gas mixes" value={gas} options={gasOptions} onChange={setGas} />
          <FilterSelect label="All dive types" value={type} options={types} onChange={setType} />
        </View>
      </View>

      <View style={{ gap: 10, zIndex: 0 }}>
        {filtered.map((dive) => (
          <Pressable key={dive.id} onPress={() => onDive(dive)} style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 14, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '800', fontFamily: 'monospace' }}>#{String(dive.diveNumber).padStart(3, '0')}</Text>
              <GasBadge gas={dive.gasMix} />
            </View>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>{date(dive.date)}</Text>
              <Text style={{ color: colors.muted, fontSize: 14 }}>{dive.siteName || 'Unnamed site'}{dive.location ? `, ${dive.location}` : ''}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View style={{ gap: 3 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>{dive.maxDepthMeters.toFixed(1)} m</Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>{Math.round(dive.duration / 60)} min</Text>
              </View>
              <RatingStars rating={dive.rating} />
            </View>
          </Pressable>
        ))}
        {filtered.length === 0 && <View style={tokens.card}><Text style={tokens.body}>{dives.length === 0 ? 'No dives recorded yet.' : 'No dives match those filters.'}</Text></View>}
      </View>
    </ScrollView>
  );
}
