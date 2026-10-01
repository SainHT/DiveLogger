import type { RecreationalGas } from './dive.model';

const OXYGEN_PERCENTAGES: Record<RecreationalGas, number> = {
  AIR: 21,
  EAN32: 32,
  EAN36: 36,
};

export function getOxygenPercentage(gas: RecreationalGas): number {
  return OXYGEN_PERCENTAGES[gas];
}

export function calculateMOD(o2Percentage: number, pO2Limit = 1.4): number {
  if (o2Percentage <= 0 || o2Percentage > 100) {
    throw new RangeError('Oxygen percentage must be greater than 0 and at most 100.');
  }
  if (pO2Limit <= 0) {
    throw new RangeError('The pO2 limit must be greater than 0.');
  }

  return ((pO2Limit / (o2Percentage / 100)) - 1) * 10;
}

export function calculateSAC(
  duration: number,
  gas: RecreationalGas,
  airconsumed: number,
): number {
  void gas;

  if (duration <= 0) {
    throw new RangeError('Dive duration must be greater than 0 seconds.');
  }
  if (airconsumed < 0) {
    throw new RangeError('Air consumed cannot be negative.');
  }

  return airconsumed / (duration / 60);
}