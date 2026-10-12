import { Text, View } from 'react-native';
import { colors, tokens } from '../styles/tokens';

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={tokens.card}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{label.toUpperCase()}</Text>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 6 }}>{value}</Text>
    </View>
  );
}
