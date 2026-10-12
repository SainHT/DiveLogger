import { ScrollView, Text, View } from "react-native";
import { GasPresetChip } from "../components/GasPresetChip";
import { StatCard } from "../components/StatCard";
import { colors, tokens } from "../styles/tokens";

export function OverviewScreen() {
  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <Text style={tokens.heading}>Dive overview</Text>
      <Text style={tokens.body}>Your local-first logbook at a glance.</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <StatCard label="Total dives" value="0" />
        </View>
        <View style={{ flex: 1 }}>
          <StatCard label="Bottom time" value="0h" />
        </View>
      </View>
      <View style={tokens.card}>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 10,
          }}
        >
          Latest gas preset
        </Text>
        <GasPresetChip gas="AIR" />
      </View>
    </ScrollView>
  );
}
