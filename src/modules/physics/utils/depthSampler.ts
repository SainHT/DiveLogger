const STANDARD_DEPTHS = [12, 15, 18, 21, 24, 27, 30, 33, 36, 40];

export function getSampledNDLDepths(maxModMeters: number, isMobile: boolean): number[] {
  const validDepths = STANDARD_DEPTHS.filter((depth) => depth <= maxModMeters);

  if (!isMobile || validDepths.length <= 3) return validDepths;

  const min = validDepths[0];
  const max = validDepths[validDepths.length - 1];
  const midpoint = validDepths.reduce((closest, depth) =>
    Math.abs(depth - (min + max) / 2) < Math.abs(closest - (min + max) / 2)
      ? depth
      : closest,
  );

  return [min, midpoint, max];
}
