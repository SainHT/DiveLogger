import { StyleSheet } from 'react-native';

export const colors = {
  background: '#0b1220',
  surface: '#111c2d',
  border: '#26364d',
  text: '#f3f7fb',
  muted: '#91a1b5',
  air: '#4da3ff',
  nitrox: '#42d392',
  trimix: '#f58bb5',
} as const;

export const tokens = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '700' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16 },
});
