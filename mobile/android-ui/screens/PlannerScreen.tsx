import { Text, View } from 'react-native';
import { colors, tokens } from '../styles/tokens';

export function PlannerScreen() {
  return <View style={{ ...tokens.screen, ...tokens.content }}><Text style={tokens.heading}>Dive planner</Text><Text style={tokens.body}>Plan depth, gas, and no-decompression limits on mobile.</Text><View style={tokens.card}><Text style={{ color: colors.text }}>Planner workspace ready.</Text></View></View>;
}
