import { calculateNDL } from "../engine/buhlmann";

export interface ProfileWaypoint {
  timeMinutes: number;
  depthMeters: number;
  phase: "Surface" | "Descent" | "Bottom" | "Deep Stop" | "Ascent" | "Safety Stop";
  note?: string;
}

export interface ProfileSample {
  timeMinutes: number;
  depthMeters: number;
  phase: ProfileWaypoint["phase"];
  note?: string;
}

export interface PlanResult {
  waypoints: ProfileWaypoint[];
  samples: ProfileSample[];
  totalTimeMinutes: number;
  maximizedBottomTimeMinutes: number;
  ndlMinutes: number;
  isDecoDive: boolean;
  hasDeepStop: boolean;
  deepStopDepthMeters: number | null;
  safetyStopDurationMinutes: number;
}

export function interpolateProfileSamples(
  waypoints: ProfileWaypoint[],
  intervalMinutes = 0.5,
): ProfileSample[] {
  if (waypoints.length === 0) return [];
  const interval = Math.max(0.1, intervalMinutes);
  const finalTime = waypoints[waypoints.length - 1].timeMinutes;
  const samples: ProfileSample[] = [];

  for (let time = 0; time < finalTime; time += interval) {
    const sampleTime = Number(Math.min(time, finalTime).toFixed(2));
    const endIndex = waypoints.findIndex((waypoint) => waypoint.timeMinutes >= sampleTime);
    const end = waypoints[Math.max(1, endIndex)];
    const start = waypoints[Math.max(0, endIndex - 1)];
    const duration = end.timeMinutes - start.timeMinutes;
    const progress = duration === 0 ? 1 : (sampleTime - start.timeMinutes) / duration;
    samples.push({
      timeMinutes: sampleTime,
      depthMeters: Number((start.depthMeters + (end.depthMeters - start.depthMeters) * progress).toFixed(2)),
      phase: progress >= 1 ? end.phase : start.phase,
      note: progress >= 1 ? end.note : start.note,
    });
  }

  const last = waypoints[waypoints.length - 1];
  samples.push({
    timeMinutes: last.timeMinutes,
    depthMeters: last.depthMeters,
    phase: last.phase,
    note: last.note,
  });
  return samples;
}

export function generateDivePlanFromTotalTime(
  maxDepthMeters: number,
  requestedTotalTimeMinutes: number,
  fO2 = 0.21,
  gfHigh = 0.85,
): PlanResult {
  const depth = Math.max(0, maxDepthMeters);
  const totalTime = Math.max(1, requestedTotalTimeMinutes);

  const ndl = calculateNDL(depth, fO2, gfHigh);
  const hasDeepStop = depth > 20;
  const deepStopDepth = hasDeepStop ? Math.round(depth / 2) : 0;

  // 1. Descent at 10 m/min
  const descent = depth / 10;

  // 2. Minimum ascent transit durations (Fastest ascent speed = 10 m/min)
  const minDeepTransit = hasDeepStop ? Math.max(0, depth - deepStopDepth) / 10 : 0;
  const minDeepToSafety = hasDeepStop
    ? Math.max(0, deepStopDepth - 5) / 10
    : Math.max(0, depth - 5) / 10;
  const finalAscent = Math.min(depth, 5) / 10; // 5m to surface at 10 m/min = 0.5 min
  const deepStopDuration = hasDeepStop ? 1 : 0;

  const getOverhead = (safetyDuration: number) =>
    descent +
    minDeepTransit +
    deepStopDuration +
    minDeepToSafety +
    safetyDuration +
    finalAscent;

  // 3. Calculate initial bottom time and cap strictly at NDL
  let safetyStopDuration = 3;
  let rawBottom = totalTime - getOverhead(safetyStopDuration);
  let bottom = Math.max(1, Math.min(rawBottom, ndl));

  // 4. Adjust safety stop duration (5 min if deep stop required or near NDL)
  if (hasDeepStop || bottom >= ndl - 2) {
    safetyStopDuration = 5;
    rawBottom = totalTime - getOverhead(safetyStopDuration);
    bottom = Math.max(1, Math.min(rawBottom, ndl));
  }

  // 5. Calculate leftover time after capping bottom time at NDL
  const minRequiredTime = bottom + getOverhead(safetyStopDuration);
  const leftoverTime = Math.max(0, totalTime - minRequiredTime);

  // 6. Distribute leftover time equally into ascent transit segments
  let deepTransit = minDeepTransit;
  let deepToSafety = minDeepToSafety;

  if (hasDeepStop) {
    deepTransit += leftoverTime / 2;
    deepToSafety += leftoverTime / 2;
  } else {
    deepToSafety += leftoverTime;
  }

  // 7. Construct profile waypoints
  const waypoints: ProfileWaypoint[] = [];
  let elapsed = 0;

  const add = (
    duration: number,
    depthMeters: number,
    phase: ProfileWaypoint["phase"],
    note?: string,
  ) => {
    elapsed += Math.max(0, duration);
    waypoints.push({
      timeMinutes: Number(elapsed.toFixed(2)),
      depthMeters,
      phase,
      note,
    });
  };

  waypoints.push({
    timeMinutes: 0,
    depthMeters: 0,
    phase: "Surface",
    note: "Dive start",
  });

  add(descent, depth, "Descent", "Maximum depth");
  add(
    bottom,
    depth,
    "Bottom",
    bottom === ndl ? "Bottom time capped at NDL" : "Planned bottom time",
  );

  if (hasDeepStop) {
    const transitNote1 =
      deepTransit > minDeepTransit
        ? "Slow ascent to deep stop"
        : "Transit to deep stop";
    add(deepTransit, deepStopDepth, "Ascent", transitNote1);
    add(1, deepStopDepth, "Deep Stop", "1 minute deep stop");

    const transitNote2 =
      deepToSafety > minDeepToSafety
        ? "Slow ascent to safety stop"
        : "Transit to safety stop";
    add(deepToSafety, 5, "Ascent", transitNote2);
  } else {
    const transitNote =
      deepToSafety > minDeepToSafety
        ? "Slow ascent to safety stop"
        : "Transit to safety stop";
    add(deepToSafety, 5, "Ascent", transitNote);
  }

  add(
    safetyStopDuration,
    5,
    "Safety Stop",
    `${safetyStopDuration} minute safety stop`,
  );
  add(finalAscent, 0, "Ascent", "Surface arrival");

  return {
    waypoints,
    samples: interpolateProfileSamples(waypoints),
    totalTimeMinutes: Number(elapsed.toFixed(1)),
    maximizedBottomTimeMinutes: Number(bottom.toFixed(1)),
    ndlMinutes: ndl,
    isDecoDive: false,
    hasDeepStop,
    deepStopDepthMeters: hasDeepStop ? deepStopDepth : null,
    safetyStopDurationMinutes: safetyStopDuration,
  };
}