import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { colors, tokens } from '../styles/tokens';

export function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <View style={tokens.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
        {icon}
      </View>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 }}>{value}</Text>
    </View>
  );
}
