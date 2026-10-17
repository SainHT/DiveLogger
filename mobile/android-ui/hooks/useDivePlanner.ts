import { useMemo, useState } from "react";
import { PanResponder } from "react-native";
import { calculateMOD } from "@scuba-log/shared/modules/physics/utils/gasCalculations";
import { calculateNDL } from "@scuba-log/shared/modules/physics/engine/buhlmann";
import { getSampledNDLDepths } from "@scuba-log/shared/modules/physics/utils/depthSampler";
import { generateDivePlanFromTotalTime } from "@scuba-log/shared/modules/physics/utils/profilePlanner";

export function useDivePlanner() {
  const [depth, setDepth] = useState(18);
  const [totalTime, setTotalTime] = useState(45);
  const [fO2, setFO2] = useState(0.21);
  const [gfLow, setGfLow] = useState(0.4);
  const [gfHigh, setGfHigh] = useState(0.85);
  const [trackWidth, setTrackWidth] = useState(300);
  const mod = calculateMOD(fO2);
  const safeDepth = Math.min(Math.max(10, depth), mod);
  const ppo2 = (1 + safeDepth / 10) * fO2;
  const warning = ppo2 >= 1.35;
  const plan = useMemo(
    () => generateDivePlanFromTotalTime(safeDepth, totalTime, fO2, gfHigh),
    [safeDepth, totalTime, fO2, gfHigh],
  );
  const ndlDepths = getSampledNDLDepths(mod, true);
  const setDepthFromTrack = (locationX: number, width: number) => {
    const position = Math.min(width, Math.max(0, locationX));
    setDepth(
      Number((10 + (position / Math.max(width, 1)) * (mod - 10)).toFixed(1)),
    );
  };
  const depthSliderResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) =>
          setDepthFromTrack(event.nativeEvent.locationX, trackWidth),
        onPanResponderMove: (event) =>
          setDepthFromTrack(event.nativeEvent.locationX, trackWidth),
      }),
    [mod, trackWidth],
  );

  return {
    depth,
    setDepth,
    totalTime,
    setTotalTime,
    fO2,
    setFO2,
    gfLow,
    setGfLow,
    gfHigh,
    setGfHigh,
    setTrackWidth,
    mod,
    safeDepth,
    ppo2,
    warning,
    plan,
    ndlDepths,
    depthSliderResponder,
  };
}

export type DivePlannerState = ReturnType<typeof useDivePlanner>;
