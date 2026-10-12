import { ScrollView, Text } from 'react-native';
import { colors, tokens } from '../styles/tokens';

export function LogbookScreen() {
  return <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}><Text style={tokens.heading}>Logbook</Text><Text style={tokens.body}>Your recorded dives will appear here.</Text><Text style={{ ...tokens.card, color: colors.muted }}>No dives recorded yet.</Text></ScrollView>;
}
