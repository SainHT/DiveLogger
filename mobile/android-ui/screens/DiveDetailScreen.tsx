import { ScrollView, Text, View, Pressable } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import type { DiveLog } from "@scuba-log/shared/modules/dives/domain/dive.model";
import {
  DeleteModal,
  DiveHeader,
  InfoCard,
  MetricsGrid,
  NotesCard,
  TelemetryCard,
} from "../components/DiveDetailSections";
import { useDiveDetail } from "../hooks/useDiveDetail";
import { colors, tokens } from "../styles/tokens";
import { value } from "../utils/diveDetail";

export function DiveDetailScreen({
  dive,
  onBack,
  onEdit,
  onDeleted,
}: {
  dive: DiveLog;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const detail = useDiveDetail(dive, onDeleted);

  return (
    <ScrollView style={tokens.screen} contentContainerStyle={tokens.content}>
      <Pressable
        onPress={onBack}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <ArrowLeft size={16} color={colors.accent} />
        <Text style={{ color: colors.accent, fontWeight: "700" }}>
          Back to logbook
        </Text>
      </Pressable>
      <DiveHeader
        dive={dive}
        onEdit={onEdit}
        onDelete={() => detail.setConfirmDelete(true)}
      />
      <TelemetryCard samples={detail.samples} />
      <MetricsGrid dive={dive} sac={detail.consumption.sacBarMin} />
      <InfoCard
        title="Environment"
        rows={[
          [
            "Water temperature",
            `${value(dive.maxWaterTempCelsius, "°")} / ${value(dive.minWaterTempCelsius, "°")} / ${value(dive.avgWaterTempCelsius, "°")} C (max / min / avg)`,
          ],
          ["Visibility", value(dive.visibilityMeters, " m")],
          ["Weather", value(dive.weather)],
          ["Conditions", value(dive.specialConditions)],
        ]}
      />
      <InfoCard
        title="Gear & setup"
        rows={[
          ["Tank", `${dive.tankType}, ${value(dive.tankCapacityLiters, " L")}`],
          ["Weight", value(dive.weightKg, " kg")],
          ["Suit", value(dive.suitType)],
          ["Equipment", value(dive.specialEquipment)],
        ]}
      />
      <NotesCard notes={dive.notes} />
      <DeleteModal
        visible={detail.confirmDelete}
        onCancel={() => detail.setConfirmDelete(false)}
        onConfirm={() => void detail.remove()}
      />
    </ScrollView>
  );
}
