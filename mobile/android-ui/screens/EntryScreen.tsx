import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ArrowLeft, Save } from "lucide-react-native";
import type { DiveLog } from "@scuba-log/shared/modules/dives/domain/dive.model";
import { useDiveEntry, dateValue, timeValue } from "../hooks/useDiveEntry";
import {
  DepthGasSection,
  GearEnvironmentSection,
  GeneralInformation,
  NotesRatingSection,
} from "../components/EntryFormSections";
import { colors, tokens } from "../styles/tokens";

export function EntryScreen({
  dive,
  onSaved,
  onCancel,
}: {
  dive?: DiveLog;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const entry = useDiveEntry(dive, onSaved);
  return (
    <ScrollView
      style={tokens.screen}
      contentContainerStyle={tokens.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={onCancel}
        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <ArrowLeft size={16} color={colors.accent} />
        <Text style={{ color: colors.accent, fontWeight: "700" }}>Back</Text>
      </Pressable>
      <View style={{ gap: 6 }}>
        <Text
          style={{ color: colors.muted, fontSize: 11, fontFamily: "monospace" }}
        >
          LOGBOOK / DIVE ENTRY
        </Text>
        <Text style={tokens.heading}>{dive ? "Edit dive." : "New dive."}</Text>
        <Text style={tokens.body}>
          Capture the essentials from the boat or shore.
        </Text>
      </View>
      <GeneralInformation
        form={entry.form}
        set={entry.set}
        onDatePress={() => entry.setPicker("date")}
      />
      <DepthGasSection
        form={entry.form}
        set={entry.set}
        setTime={entry.setTime}
        onStartPress={() => entry.setPicker("startTime")}
        onEndPress={() => entry.setPicker("endTime")}
        mod={entry.mod}
      />
      <GearEnvironmentSection
        form={entry.form}
        set={entry.set}
        presets={entry.presets}
        onPreset={entry.applyPreset}
        selectedPresetId={entry.selectedPresetId}
        isCustom={entry.isCustom}
      />
      <NotesRatingSection form={entry.form} set={entry.set} />
      {entry.error && (
        <Text style={{ color: "#fbbf24", fontSize: 12 }}>{entry.error}</Text>
      )}
      <View
        style={{ flexDirection: "row", justifyContent: "flex-end", gap: 9 }}
      >
        <Pressable
          onPress={onCancel}
          style={{
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "700" }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={() => void entry.save()}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 4,
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Save size={16} color={colors.background} />
          <Text style={{ color: colors.background, fontWeight: "800" }}>
            Save dive
          </Text>
        </Pressable>
      </View>
      {Platform.OS !== "web" && entry.picker && (
        <DateTimePicker
          value={
            entry.picker === "date"
              ? dateValue(entry.form.date)
              : timeValue(
                  entry.picker === "startTime"
                    ? entry.form.startTime
                    : entry.form.endTime,
                )
          }
          mode={entry.picker === "date" ? "date" : "time"}
          is24Hour
          display="default"
          onChange={entry.onPickerChange}
        />
      )}
    </ScrollView>
  );
}
