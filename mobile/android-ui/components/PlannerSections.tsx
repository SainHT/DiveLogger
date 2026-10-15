import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import Svg, { Defs, LinearGradient, Line as SvgLine, Path, Stop, Text as SvgText } from "react-native-svg";
import { calculateNDL } from "@scuba-log/shared/modules/physics/engine/buhlmann";
import { generateDivePlanFromTotalTime } from "@scuba-log/shared/modules/physics/utils/profilePlanner";
import { colors, tokens } from "../styles/tokens";
import { factors, gases } from "../utils/planner";
import type { DivePlannerState } from "../hooks/useDivePlanner";

const inputStyle = {
  color: colors.text,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 4,
  backgroundColor: colors.background,
  paddingHorizontal: 10,
  paddingVertical: 9,
};

export function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: open ? 20 : 1, elevation: open ? 20 : 1 }}>
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={{
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 4,
          backgroundColor: colors.background,
          padding: 11,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: colors.text }}>{value}</Text>
        <Text style={{ color: colors.muted }}>{open ? "▴" : "▾"}</Text>
      </Pressable>
      {open && (
        <View
          style={{
            position: "absolute",
            top: 43,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
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
              style={{ padding: 11 }}
            >
              <Text style={{ color: option === value ? colors.accent : colors.text }}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function ProfileChart({
  samples,
  maxDepth,
  deepStop,
  safetyStop,
}: {
  samples: ReturnType<typeof generateDivePlanFromTotalTime>["samples"];
  maxDepth: number;
  deepStop: number | null;
  safetyStop: number;
}) {
  const [width, setWidth] = useState(320);
  const chartMotion = useRef(new Animated.Value(1)).current;
  const height = 190;
  const left = 32;
  const bottom = 24;
  const maxTime = Math.max(...samples.map((sample) => sample.timeMinutes), 1);
  const chartDepth = Math.max(10, maxDepth + 5);
  const x = (time: number) => left + (time / maxTime) * (width - left - 10);
  const y = (depth: number) => 10 + (depth / chartDepth) * (height - 10 - bottom);
  const path = samples
    .map((sample, index) => `${index ? "L" : "M"} ${x(sample.timeMinutes)} ${y(sample.depthMeters)}`)
    .join(" ");
  const area = `${path} L ${x(maxTime)} ${height - bottom} L ${x(0)} ${height - bottom} Z`;
  useEffect(() => {
    chartMotion.setValue(0.92);
    Animated.spring(chartMotion, {
      toValue: 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [chartMotion, samples]);
  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ gap: 10 }}>
      <Animated.View style={{ transform: [{ scaleY: chartMotion }], opacity: chartMotion }}>
        <Svg width="100%" height={height}>
          <Defs>
            <LinearGradient id="plannerFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity="0.55" />
              <Stop offset="1" stopColor={colors.accent} stopOpacity="0.04" />
            </LinearGradient>
          </Defs>
          {[0, 0.5, 1].map((mark) => (
            <SvgLine key={mark} x1={left} x2={width - 10} y1={y(mark * chartDepth)} y2={y(mark * chartDepth)} stroke={colors.border} strokeDasharray="3 3" />
          ))}
          {deepStop != null && <SvgLine x1={left} x2={width - 10} y1={y(deepStop)} y2={y(deepStop)} stroke="#f59e0b" strokeDasharray="4 4" />}
          <SvgLine x1={left} x2={width - 10} y1={y(5)} y2={y(5)} stroke="#10b981" strokeDasharray="4 4" />
          <SvgText x="2" y="16" fill={colors.muted} fontSize="10">0m</SvgText>
          <SvgText x="0" y={height - bottom} fill={colors.muted} fontSize="10">{maxDepth.toFixed(0)}m</SvgText>
          <Path d={area} fill="url(#plannerFill)" />
          <Path d={path} fill="none" stroke={colors.accent} strokeWidth="2.5" />
          <SvgText x={left} y={height - 5} fill={colors.muted} fontSize="10">0 min</SvgText>
          <SvgText x={width - 45} y={height - 5} fill={colors.muted} fontSize="10">{maxTime.toFixed(0)} min</SvgText>
        </Svg>
      </Animated.View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
        {deepStop != null && <Text style={{ color: "#fbbf24", borderColor: "#92400e", borderWidth: 1, padding: 5, fontSize: 11 }}>Deep Stop · {deepStop}m · 1 min</Text>}
        <Text style={{ color: "#34d399", borderColor: "#047857", borderWidth: 1, padding: 5, fontSize: 11 }}>Safety Stop · 5m · {safetyStop} min</Text>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: "50%", borderColor: colors.border, borderWidth: 1, padding: 11, gap: 5 }}>
      <Text style={{ color: colors.muted, fontSize: 10, fontFamily: "monospace" }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "800" }}>{value}</Text>
    </View>
  );
}

export function NdlLimitsCard({ planner }: { planner: DivePlannerState }) {
  const { fO2, gfHigh, ndlDepths, setDepth } = planner;
  return (
    <View style={tokens.card}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>Limits by depth</Text>
        <Text style={{ color: colors.accent, fontSize: 12 }}>GF High {Math.round(gfHigh * 100)}%</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 7 }}>
        {ndlDepths.map((item) => (
          <Pressable key={item} onPress={() => setDepth(item)} style={{ flex: 1, alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 5, padding: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>{item} m</Text>
            <Text style={{ color: colors.text, fontWeight: "800", marginTop: 5 }}>{calculateNDL(item, fO2, gfHigh)} min</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function ProfilePreviewCard({ planner }: { planner: DivePlannerState }) {
  const { plan, safeDepth, mod, ppo2, warning, gfLow, gfHigh } = planner;
  return (
    <View style={{ ...tokens.card, gap: 12, borderColor: warning ? "#be123c" : colors.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ gap: 5 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "monospace" }}>PROFILE PREVIEW</Text>
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }}>Interactive dive profile</Text>
        </View>
        <Text style={{ color: warning ? "#fda4af" : colors.accent, fontSize: 11, fontWeight: "800", maxWidth: 145, textAlign: "right" }}>
          {warning ? `⚠ High PPO₂ Warning: ${ppo2.toFixed(2)} bar` : `PPO₂: ${ppo2.toFixed(2)} bar`}
        </Text>
      </View>
      <ProfileChart samples={plan.samples} maxDepth={safeDepth} deepStop={plan.hasDeepStop ? plan.deepStopDepthMeters : null} safetyStop={plan.safetyStopDurationMinutes} />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Metric label="NDL" value={`${plan.ndlMinutes} min`} />
        <Metric label="BOTTOM TIME" value={`${plan.maximizedBottomTimeMinutes} min`} />
        <Metric label="MOD" value={`${mod.toFixed(1)} m`} />
        <Metric label="GF LOW / HIGH" value={`${Math.round(gfLow * 100)} / ${Math.round(gfHigh * 100)}%`} />
      </View>
      {plan.isDecoDive && <Text style={{ color: "#f87171" }}>Decompression warning: requested runtime exceeds the no-decompression limit.</Text>}
    </View>
  );
}

export function DiveSetupCard({ planner }: { planner: DivePlannerState }) {
  const { fO2, setFO2, gfLow, setGfLow, gfHigh, setGfHigh, safeDepth, mod, totalTime, setTotalTime, setTrackWidth, depthSliderResponder } = planner;
  return (
    <View style={tokens.card}>
      <Text style={{ color: colors.muted, fontSize: 11, fontFamily: "monospace", marginBottom: 5 }}>DIVE SETUP</Text>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800", marginBottom: 12 }}>Plan this dive</Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 5 }}>Gas mix</Text>
      <Select value={gases.find((gas) => gas.fO2 === fO2)?.label ?? gases[0].label} options={gases.map((gas) => gas.label)} onChange={(label) => setFO2(gases.find((gas) => gas.label === label)?.fO2 ?? 0.21)} />
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 12, marginBottom: 6 }}>Gradient factors</Text>
      <View style={{ flexDirection: "row", gap: 5 }}>
        {factors.map((factor) => {
          const selected = gfLow === factor.low && gfHigh === factor.high;
          return <Pressable key={factor.label} onPress={() => { setGfLow(factor.low); setGfHigh(factor.high); }} style={{ flex: 1, borderColor: selected ? colors.accent : colors.border, borderWidth: 1, borderRadius: 4, padding: 7, alignItems: "center", backgroundColor: selected ? "#083344" : colors.background }}>
            <Text numberOfLines={1} style={{ color: colors.text, fontSize: 10 }}>{factor.label}</Text>
            <Text style={{ color: colors.muted, fontSize: 10 }}>{factor.display}</Text>
          </Pressable>;
        })}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Target depth</Text>
        <Text style={{ color: colors.accent, fontWeight: "700" }}>{safeDepth.toFixed(1)} m / {mod.toFixed(1)} m MOD</Text>
      </View>
      <View onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)} style={{ height: 38, justifyContent: "center" }} {...depthSliderResponder.panHandlers}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border }}>
          <View style={{ width: `${((safeDepth - 10) / Math.max(mod - 10, 1)) * 100}%`, height: 6, backgroundColor: colors.accent, borderRadius: 3 }} />
        </View>
        <View style={{ position: "absolute", left: `${((safeDepth - 10) / Math.max(mod - 10, 1)) * 100}%`, marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, borderColor: colors.text, borderWidth: 2 }} />
      </View>
      <TextInput value={String(totalTime)} onChangeText={(value) => { const next = Number(value); if (Number.isFinite(next)) setTotalTime(Math.min(180, Math.max(1, next))); }} keyboardType="numeric" placeholder="45" placeholderTextColor={colors.muted} style={{ ...inputStyle, marginTop: 8 }} />
      <Text style={{ color: colors.muted, fontSize: 12 }}>Total planned dive time (min)</Text>
    </View>
  );
}
