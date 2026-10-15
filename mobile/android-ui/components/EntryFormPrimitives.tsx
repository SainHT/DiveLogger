import { createElement, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { colors, tokens } from "../styles/tokens";

export const inputStyle = {
  color: colors.text,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  paddingHorizontal: 10,
  paddingVertical: 9,
  backgroundColor: colors.background,
};

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  flex = 1,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  flex?: number;
  multiline?: boolean;
}) {
  return (
    <View style={{ flex, gap: 5 }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        style={{
          ...inputStyle,
          minHeight: multiline ? 85 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export function PickerField({
  label,
  value,
  mode,
  onChange,
  onPress,
}: {
  label: string;
  value: string;
  mode: "date" | "time";
  onChange: (value: string) => void;
  onPress: () => void;
}) {
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
        {createElement("input", {
          "aria-label": label,
          type: mode,
          value,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(event.currentTarget.value),
          style: {
            boxSizing: "border-box",
            width: "100%",
            minHeight: 40,
            color: colors.text,
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            padding: "9px 10px",
            fontFamily: "inherit",
            fontSize: 14,
            cursor: "pointer",
          },
        })}
      </View>
    );
  }
  return (
    <View style={{ flex: 1, gap: 5 }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={inputStyle}>
        <Text style={{ color: colors.text }}>
          {value || (mode === "date" ? "Select date" : "Select time")}
        </Text>
      </Pressable>
    </View>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
  flex = 1,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  flex?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View
      style={{ flex, gap: 5, zIndex: open ? 20 : 1, elevation: open ? 20 : 1 }}
    >
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={{
          ...inputStyle,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 13 }}>
          {value || "Select"}
        </Text>
        <Text style={{ color: colors.muted }}>{open ? "▴" : "▾"}</Text>
      </Pressable>
      {open && (
        <View
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            zIndex: 30,
            elevation: 30,
          }}
        >
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={{ padding: 10 }}
            >
              <Text style={{ color: option === value ? colors.accent : colors.text, fontSize: 13 }}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ ...tokens.card, gap: 12, zIndex: 1 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
      {children}
    </View>
  );
}
