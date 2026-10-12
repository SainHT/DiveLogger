import { Text, View } from 'react-native';
import { colors } from '../styles/tokens';

const gasColors = { AIR: colors.air, EAN32: colors.nitrox, EAN36: colors.nitrox, TRIMIX: colors.trimix };

export function GasPresetChip({ gas }: { gas: keyof typeof gasColors }) {
  return <View style={{ alignSelf: 'flex-start', borderColor: gasColors[gas], borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ color: gasColors[gas], fontWeight: '700' }}>{gas}</Text></View>;
}
