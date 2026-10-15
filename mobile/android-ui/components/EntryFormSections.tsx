import { Pressable, Text, View } from "react-native";
import { Star } from "lucide-react-native";
import type { EquipmentPreset, SuitType, TankType } from "@scuba-log/shared/modules/equipment/domain/preset.model";
import type { RecreationalGas, WaterType } from "@scuba-log/shared/modules/dives/domain/dive.model";
import { colors } from "../styles/tokens";
import { Card, Field, PickerField, Select } from "./EntryFormPrimitives";
import {
  type Form,
  type SetForm,
  type TimeKey,
  gasTypes,
  suitTypes,
  tankTypes,
  waterTypes,
} from "../hooks/useDiveEntry";

type CommonProps = { form: Form; set: SetForm };

export function GeneralInformation({ form, set, onDatePress }: CommonProps & { onDatePress: () => void }) {
  return (
    <Card title="General information">
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Dive number *" placeholder="e.g. 42" value={form.number} onChangeText={(value) => set("number", value)} keyboardType="numeric" />
        <PickerField label="Date *" value={form.date} mode="date" onChange={(value) => set("date", value)} onPress={onDatePress} />
      </View>
      <Field label="Buddy" placeholder="e.g. Alex" value={form.buddy} onChangeText={(value) => set("buddy", value)} />
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Site name *" placeholder="e.g. Blue Hole" value={form.site} onChangeText={(value) => set("site", value)} />
        <Field label="Location *" placeholder="e.g. Dahab, Egypt" value={form.location} onChangeText={(value) => set("location", value)} />
      </View>
      <Field label="Dive type *" placeholder="e.g. Reef, Wreck, Cave" value={form.type} onChangeText={(value) => set("type", value)} />
    </Card>
  );
}

export function DepthGasSection({
  form,
  set,
  setTime,
  onStartPress,
  onEndPress,
  mod,
}: CommonProps & { setTime: (key: TimeKey, value: string) => void; onStartPress: () => void; onEndPress: () => void; mod: number }) {
  return (
    <Card title="Depths, duration and gas">
      <PickerField label="Dive start time" value={form.startTime} mode="time" onChange={(value) => setTime("startTime", value)} onPress={onStartPress} />
      <Field label="Duration (min) *" placeholder="e.g. 31" value={form.duration} onChangeText={(value) => setTime("duration", value)} keyboardType="numeric" />
      <PickerField label="Dive end time" value={form.endTime} mode="time" onChange={(value) => setTime("endTime", value)} onPress={onEndPress} />
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Max depth (m) *" placeholder="e.g. 30" value={form.max} onChangeText={(value) => set("max", value)} keyboardType="numeric" />
        <Field label="Average depth (m)" placeholder="e.g. 18" value={form.avg} onChangeText={(value) => set("avg", value)} keyboardType="numeric" />
      </View>
      <Select label="Water type" value={form.water} options={waterTypes} onChange={(value) => set("water", value as WaterType)} />
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Start pressure (bar) *" placeholder="e.g. 200" value={form.start} onChangeText={(value) => set("start", value)} keyboardType="numeric" />
        <Field label="End pressure (bar) *" placeholder="e.g. 50" value={form.end} onChangeText={(value) => set("end", value)} keyboardType="numeric" />
      </View>
      <Select label="Gas mix *" value={form.gas} options={gasTypes} onChange={(value) => set("gas", value as RecreationalGas)} />
      <Text style={{ color: colors.accent, fontSize: 12 }}>Recommended MOD: {mod.toFixed(1)} m</Text>
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Tank capacity (L)" placeholder="e.g. 12" value={form.tankCapacity} onChangeText={(value) => set("tankCapacity", value)} keyboardType="numeric" />
        <Select label="Tank type *" value={form.tank} options={tankTypes} onChange={(value) => set("tank", value as TankType)} />
      </View>
    </Card>
  );
}

export function GearEnvironmentSection({ form, set, presets, onPreset }: CommonProps & { presets: EquipmentPreset[]; onPreset: (id: string) => void }) {
  return (
    <Card title="Gear and environment">
      <Select label="Equipment preset" value="" options={presets.map((preset) => preset.name)} onChange={(name) => {
        const preset = presets.find((item) => item.name === name);
        if (preset) onPreset(preset.id);
      }} />
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Weight (kg) *" placeholder="e.g. 6" value={form.weight} onChangeText={(value) => set("weight", value)} keyboardType="numeric" />
        <Select label="Suit type" value={form.suit} options={suitTypes} onChange={(value) => set("suit", value as SuitType)} />
      </View>
      <Field label="Special equipment" placeholder="e.g. DSMB, camera" value={form.equipment} onChangeText={(value) => set("equipment", value)} />
      <View style={{ flexDirection: "row", gap: 7 }}>
        <Field label="Min temp (°C)" placeholder="e.g. 18" value={form.minTemp} onChangeText={(value) => set("minTemp", value)} keyboardType="numeric" />
        <Field label="Avg temp (°C)" placeholder="e.g. 23" value={form.avgTemp} onChangeText={(value) => set("avgTemp", value)} keyboardType="numeric" />
        <Field label="Max temp (°C)" placeholder="e.g. 28" value={form.maxTemp} onChangeText={(value) => set("maxTemp", value)} keyboardType="numeric" />
      </View>
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Field label="Weather" placeholder="e.g. Sunny" value={form.weather} onChangeText={(value) => set("weather", value)} flex={2} />
        <Field label="Visibility (m)" placeholder="e.g. 30" value={form.visibility} onChangeText={(value) => set("visibility", value)} flex={1} keyboardType="numeric" />
      </View>
      <Field label="Special conditions" placeholder="e.g. Mild current" value={form.conditions} onChangeText={(value) => set("conditions", value)} />
    </Card>
  );
}

export function NotesRatingSection({ form, set }: CommonProps) {
  return (
    <Card title="Notes and rating">
      <Field label="Personal notes" placeholder="Add notes about this dive" value={form.notes} onChangeText={(value) => set("notes", value)} multiline />
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Rating</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => set("rating", star)}>
              <Star size={25} color={star <= form.rating ? "#facc15" : colors.muted} fill={star <= form.rating ? "#facc15" : "transparent"} />
            </Pressable>
          ))}
        </View>
      </View>
    </Card>
  );
}
