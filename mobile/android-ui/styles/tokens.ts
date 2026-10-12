import { StyleSheet } from 'react-native';

export const colors = {
  background: '#0f172a',
  surface: '#111827',
  border: '#1e293b',
  text: '#f8fafc',
  muted: '#94a3b8',
  accent: '#22d3ee',
  air: '#22d3ee',
  nitrox: '#34d399',
  trimix: '#f472b6',
} as const;

export const tokens = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 28 },
  heading: { color: colors.text, fontSize: 26, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 6, padding: 14 },
});
