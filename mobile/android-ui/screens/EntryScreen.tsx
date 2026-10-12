import { Text, View } from 'react-native';
import { colors, tokens } from '../styles/tokens';

export function EntryScreen() {
  return <View style={{ ...tokens.screen, ...tokens.content }}><Text style={tokens.heading}>New dive</Text><Text style={tokens.body}>Capture depth, gas, conditions, and notes from the boat or shore.</Text><View style={tokens.card}><Text style={{ color: colors.text }}>Entry form ready for shared dive data.</Text></View></View>;
}
