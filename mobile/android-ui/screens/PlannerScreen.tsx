import { ScrollView, Text, View } from "react-native";
import { DiveSetupCard, NdlLimitsCard, ProfilePreviewCard } from "../components/PlannerSections";
import { useDivePlanner } from "../hooks/useDivePlanner";
import { colors, tokens } from "../styles/tokens";

export function PlannerScreen() {
  const planner = useDivePlanner();
  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "monospace" }}>PLANNING / RECREATIONAL</Text>
        <Text style={tokens.heading}>Recreational Dive Planner</Text>
        <Text style={tokens.body}>Single-gas planning with conservative PPO₂ limits.</Text>
      </View>
      <NdlLimitsCard planner={planner} />
      <ProfilePreviewCard planner={planner} />
      <DiveSetupCard planner={planner} />
    </ScrollView>
  );
}
