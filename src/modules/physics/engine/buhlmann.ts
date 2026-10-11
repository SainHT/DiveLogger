import type { TissueCompartment } from "../domain/physics.types";

export type { TissueCompartment };

export const ZHL16C_N2_TABLE: ReadonlyArray<
  Omit<TissueCompartment, "pN2">
> = [
  { halfLifeN2: 4, a: 1.2599, b: 0.505 },
  { halfLifeN2: 8, a: 1, b: 0.6514 },
  { halfLifeN2: 12.5, a: 0.8618, b: 0.7222 },
  { halfLifeN2: 18.5, a: 0.7562, b: 0.7825 },
  { halfLifeN2: 27, a: 0.62, b: 0.8126 },
  { halfLifeN2: 38.3, a: 0.5043, b: 0.8434 },
  { halfLifeN2: 54.3, a: 0.441, b: 0.8693 },
  { halfLifeN2: 77, a: 0.4, b: 0.891 },
  { halfLifeN2: 109, a: 0.375, b: 0.9092 },
  { halfLifeN2: 146, a: 0.35, b: 0.9222 },
  { halfLifeN2: 187, a: 0.3295, b: 0.9319 },
  { halfLifeN2: 239, a: 0.3065, b: 0.9403 },
  { halfLifeN2: 305, a: 0.2835, b: 0.9475 },
  { halfLifeN2: 390, a: 0.261, b: 0.9534 },
  { halfLifeN2: 498, a: 0.248, b: 0.9582 },
  { halfLifeN2: 635, a: 0.2327, b: 0.9625 },
];

const WATER_VAPOUR_PRESSURE_BAR = 0.0567;
const SURFACE_N2_FRACTION = 0.79;
const SURFACE_PRESSURE_BAR = 1;

export function calculateNDL(
  depthMeters: number,
  fO2 = 0.21,
  gradientFactorHigh = 0.85,
): number {
  if (
    !Number.isFinite(depthMeters) ||
    depthMeters < 0 ||
    fO2 <= 0 ||
    fO2 >= 1 ||
    gradientFactorHigh <= 0 ||
    gradientFactorHigh > 1
  ) {
    return 0;
  }

  const ambientPressure = 1 + depthMeters / 10;
  const alveolarN2 = (ambientPressure - WATER_VAPOUR_PRESSURE_BAR) * (1 - fO2);
  const initialN2 = (1 - WATER_VAPOUR_PRESSURE_BAR) * SURFACE_N2_FRACTION;

  for (let minutes = 1; minutes <= 300; minutes += 1) {
    const exceedsLimit = ZHL16C_N2_TABLE.some((compartment) => {
      const tissueN2 =
        initialN2 +
        (alveolarN2 - initialN2) *
          (1 - Math.pow(2, -minutes / compartment.halfLifeN2));
      const mValue =
        compartment.a + SURFACE_PRESSURE_BAR / compartment.b;
      const allowedN2 =
        SURFACE_PRESSURE_BAR +
        gradientFactorHigh * (mValue - SURFACE_PRESSURE_BAR);
      return tissueN2 > allowedN2;
    });

    if (exceedsLimit) return minutes - 1;
  }

  return 300;
}
