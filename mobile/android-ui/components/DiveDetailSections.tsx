import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Line as SvgLine,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { CalendarDays, Edit3, MapPin, Star, Trash2 } from "lucide-react-native";
import type { DiveLog, DiveProfileSample } from "@scuba-log/shared/modules/dives/domain/dive.model";
import { colors, tokens } from "../styles/tokens";
import { formatTime, value } from "../utils/diveDetail";

export function RatingStars({ rating }: { rating?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          color={star <= (rating ?? 0) ? "#facc15" : colors.muted}
          fill={star <= (rating ?? 0) ? "#facc15" : "transparent"}
        />
      ))}
    </View>
  );
}

export function ProfileChart({ samples }: { samples: DiveProfileSample[] }) {
  const [visible, setVisible] = useState({
    depth: true,
    temperature: true,
    pressure: true,
  });
  const [width, setWidth] = useState(320);
  const height = 190;
  const pad = { left: 32, right: 12, top: 12, bottom: 24 };
  const maxDepth = Math.max(...samples.map((sample) => sample.depthMeters), 1);
  const maxTemp = Math.max(
    ...samples.map((sample) => sample.temperatureCelsius ?? 0),
    1,
  );
  const maxPressure = Math.max(
    ...samples.map((sample) => sample.pressureBar ?? 0),
    1,
  );
  const x = (index: number) =>
    pad.left +
    (index / Math.max(samples.length - 1, 1)) * (width - pad.left - pad.right);
  const y = (chartValue: number, max: number) =>
    pad.top + (chartValue / max) * (height - pad.top - pad.bottom);
  const linePath = (values: number[], max: number) =>
    values
      .map(
        (item, index) =>
          `${index === 0 ? "M" : "L"} ${x(index)} ${y(item, max)}`,
      )
      .join(" ");
  const depthPath = linePath(
    samples.map((sample) => sample.depthMeters),
    maxDepth,
  );
  const areaPath = `${depthPath} L ${x(samples.length - 1)} ${height - pad.bottom} L ${x(0)} ${height - pad.bottom} Z`;
  const toggle = (key: keyof typeof visible) =>
    setVisible((current) => ({ ...current, [key]: !current[key] }));

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ gap: 10 }}
    >
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id="depthFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity="0.55" />
            <Stop offset="1" stopColor={colors.accent} stopOpacity="0.04" />
          </LinearGradient>
        </Defs>
        {[0, 0.5, 1].map((mark) => (
          <SvgLine
            key={mark}
            x1={pad.left}
            x2={width - pad.right}
            y1={y(mark * maxDepth, maxDepth)}
            y2={y(mark * maxDepth, maxDepth)}
            stroke={colors.border}
            strokeDasharray="3 3"
          />
        ))}
        <SvgText x="2" y={pad.top + 4} fill={colors.muted} fontSize="10">
          0m
        </SvgText>
        <SvgText
          x="0"
          y={height - pad.bottom}
          fill={colors.muted}
          fontSize="10"
        >
          {maxDepth.toFixed(0)}m
        </SvgText>
        {visible.depth && (
          <Path d={areaPath} fill="url(#depthFill)" stroke="none" />
        )}
        {visible.depth && (
          <Path
            d={depthPath}
            fill="none"
            stroke={colors.accent}
            strokeWidth="2"
          />
        )}
        {visible.temperature && (
          <Path
            d={linePath(
              samples.map((sample) => sample.temperatureCelsius ?? 0),
              maxTemp,
            )}
            fill="none"
            stroke="#fb923c"
            strokeWidth="1.5"
          />
        )}
        {visible.pressure && (
          <Path
            d={linePath(
              samples.map((sample) => sample.pressureBar ?? 0),
              maxPressure,
            )}
            fill="none"
            stroke={colors.text}
            strokeWidth="1.5"
          />
        )}
        <SvgText x={pad.left} y={height - 5} fill={colors.muted} fontSize="10">
          {formatTime(samples[0].timestampSeconds)}
        </SvgText>
        <SvgText
          x={width - 48}
          y={height - 5}
          fill={colors.muted}
          fontSize="10"
        >
          {formatTime(samples[samples.length - 1].timestampSeconds)}
        </SvgText>
      </Svg>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {(
          [
            ["depth", "Depth", colors.accent],
            ["temperature", "Temperature", "#fb923c"],
            ["pressure", "Pressure", colors.text],
          ] as const
        ).map(([key, label, color]) => (
          <Pressable
            key={key}
            onPress={() => toggle(key)}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                borderColor: color,
                borderWidth: 1,
                backgroundColor: visible[key] ? color : "transparent",
                borderRadius: 2,
              }}
            />
            <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function Metric({
  label,
  value: metricValue,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        width: "50%",
        backgroundColor: "#111827e6",
        borderColor: colors.border,
        borderWidth: 1,
        padding: 10,
        gap: 7,
      }}
    >
      <Text
        style={{
          color: colors.muted,
          fontSize: 10,
          textTransform: "uppercase",
          fontFamily: "monospace",
        }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}
      >
        {metricValue}
      </Text>
    </View>
  );
}

export function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <View style={{ ...tokens.card, gap: 12 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
        {title}
      </Text>
      {rows.map(([label, rowValue]) => (
        <View
          key={label}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: "700",
              flex: 1,
              textAlign: "right",
            }}
          >
            {rowValue}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function DiveHeader({
  dive,
  onEdit,
  onDelete,
}: {
  dive: DiveLog;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          fontWeight: "700",
          fontFamily: "monospace",
        }}
      >
        DIVE #{String(dive.diveNumber).padStart(3, "0")}
      </Text>
      <Text style={tokens.heading}>{dive.siteName || "Unnamed site"}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Text style={{ color: colors.muted }}>
          <MapPin size={14} color={colors.accent} /> {dive.location || "—"}
        </Text>
        <Text style={{ color: colors.muted }}>
          <CalendarDays size={14} color={colors.accent} />{" "}
          {new Date(dive.date).toLocaleDateString()}
        </Text>
        <Text style={{ color: colors.muted }}>Buddy: {dive.buddy || "—"}</Text>
        <Text style={{ color: colors.muted }}>
          {dive.waterType ?? "—"} water
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 5,
        }}
      >
        <RatingStars rating={dive.rating} />
        <Pressable
          onPress={onEdit}
          style={{
            backgroundColor: colors.surface,
            borderColor: "#334155",
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 13,
            paddingVertical: 9,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Edit3 size={15} color={colors.text} />
          <Text style={{ color: colors.text, fontWeight: "700" }}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={{
            backgroundColor: "#450a0acc",
            borderColor: "#991b1b99",
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 13,
            paddingVertical: 9,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Trash2 size={15} color="#fca5a5" />
          <Text style={{ color: "#fca5a5", fontWeight: "700" }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function TelemetryCard({ samples }: { samples: DiveProfileSample[] }) {
  return (
    <View style={{ ...tokens.card, gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View style={{ gap: 5 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "monospace" }}>
            TELEMETRY
          </Text>
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }}>
            Depth profile
          </Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          {samples.length ? `${samples.length} samples` : "Manual log"}
        </Text>
      </View>
      {samples.length ? (
        <ProfileChart samples={samples} />
      ) : (
        <View
          style={{
            minHeight: 150,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Manual Dive Log — No computer profile graph available
          </Text>
        </View>
      )}
    </View>
  );
}

export function MetricsGrid({
  dive,
  sac,
}: {
  dive: DiveLog;
  sac: number;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      <Metric label="Max depth" value={value(dive.maxDepthMeters, " m")} />
      <Metric label="Avg depth" value={value(dive.avgDepthMeters, " m")} />
      <Metric label="Duration" value={`${Math.floor(dive.duration / 60)} min`} />
      <Metric
        label="Tank pressure"
        value={`${dive.startPressureBar} → ${dive.endPressureBar} bar`}
      />
      <Metric label="Gas mix" value={dive.gasMix} />
      <Metric label="SAC" value={`${sac.toFixed(2)} bar/min`} />
    </View>
  );
}

export function NotesCard({ notes }: { notes?: string }) {
  return (
    <View style={tokens.card}>
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          fontFamily: "monospace",
          marginBottom: 8,
        }}
      >
        PERSONAL NOTES
      </Text>
      <Text style={{ color: colors.text, lineHeight: 22 }}>
        {notes || "No notes recorded for this dive."}
      </Text>
    </View>
  );
}

export function DeleteModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#020617cc",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 6,
            padding: 18,
            gap: 12,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }}>
            Delete this dive?
          </Text>
          <Text style={{ color: colors.muted }}>
            This action cannot be undone.
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 9,
            }}
          >
            <Pressable
              onPress={onCancel}
              style={{
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 4,
                padding: 10,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                backgroundColor: "#ef4444",
                borderRadius: 4,
                padding: 10,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "800" }}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
