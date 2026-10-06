export interface SacInput {
  startPressureBar: number;
  endPressureBar: number;
  durationMinutes: number;
  avgDepthMeters: number;
  tankCapacityLiters?: number;
}

export interface SacResult {
  sacBarMin: number;
  rmvLmin: number | null;
}

export interface TissueCompartment {
  halfLifeN2: number;
  a: number;
  b: number;
  pN2: number;
}
