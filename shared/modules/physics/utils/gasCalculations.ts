import type { SacInput, SacResult } from "../domain/physics.types";

export type { SacInput, SacResult };

export function calculateSAC(input: SacInput): SacResult {
  const {
    startPressureBar,
    endPressureBar,
    durationMinutes,
    avgDepthMeters,
    tankCapacityLiters,
  } = input;

  if (
    !Number.isFinite(startPressureBar) ||
    !Number.isFinite(endPressureBar) ||
    !Number.isFinite(durationMinutes) ||
    !Number.isFinite(avgDepthMeters) ||
    durationMinutes <= 0 ||
    avgDepthMeters < 0 ||
    startPressureBar <= endPressureBar
  ) {
    return { sacBarMin: 0, rmvLmin: null };
  }

  const ambientPressure = 1 + avgDepthMeters / 10;
  const sacBarMin =
    (startPressureBar - endPressureBar) / (durationMinutes * ambientPressure);
  const rmvLmin =
    tankCapacityLiters != null &&
    Number.isFinite(tankCapacityLiters) &&
    tankCapacityLiters > 0
      ? sacBarMin * tankCapacityLiters
      : null;

  return {
    sacBarMin: Number(sacBarMin.toFixed(2)),
    rmvLmin: rmvLmin == null ? null : Number(rmvLmin.toFixed(2)),
  };
}

export function calculateMOD(fO2: number, maxPPO2 = 1.4): number {
  if (!Number.isFinite(fO2) || fO2 <= 0 || fO2 > 1 || maxPPO2 <= 0) {
    return 0;
  }

  return Number(Math.max(0, (maxPPO2 / fO2 - 1) * 10).toFixed(1));
}

export function calculateEAD(depthMeters: number, fO2 = 0.21): number {
  if (!Number.isFinite(depthMeters) || depthMeters < 0 || fO2 <= 0 || fO2 >= 1) {
    return 0;
  }

  const equivalentDepth = ((depthMeters + 10) * (1 - fO2)) / 0.79 - 10;
  return Number(Math.max(0, equivalentDepth).toFixed(1));
}
