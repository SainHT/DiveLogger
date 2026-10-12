import type { ProfileSample } from '../domain/profile.model';

export interface MockProfileOptions {
  durationSeconds?: number;
  maxDepthMeters?: number;
  startPressureBar?: number;
  endPressureBar?: number;
  surfaceTemperatureCelsius?: number;
  intervalSeconds?: number;
}

/**
 * Creates a deterministic profile that resembles a recreational dive:
 * descent, bottom time, safety stop, and a controlled ascent.
 */
export function generateMockProfile(
  diveId: string,
  options: MockProfileOptions = {},
): ProfileSample[] {
  const duration = Math.max(120, options.durationSeconds ?? 300);
  const maxDepth = Math.max(6, options.maxDepthMeters ?? 20);
  const startPressure = options.startPressureBar ?? 210;
  const endPressure = options.endPressureBar ?? 60;
  const interval = Math.max(1, options.intervalSeconds ?? 5);
  const surfaceTemperature = options.surfaceTemperatureCelsius ?? 25;
  const descentEnd = Math.min(duration * 0.2, 60);
  const safetyStart = Math.max(descentEnd + 30, duration * 0.78);
  const ascentStart = Math.max(safetyStart - 45, duration * 0.7);

  const samples: ProfileSample[] = [];
  for (let time = 0; time <= duration; time += interval) {
    const depth =
      time <= descentEnd
        ? (time / descentEnd) * maxDepth
        : time < ascentStart
          ? maxDepth
          : time < safetyStart
            ? maxDepth - ((time - ascentStart) / (safetyStart - ascentStart)) * (maxDepth - 5)
            : 5 - ((time - safetyStart) / (duration - safetyStart)) * 5;
    const normalizedTime = time / duration;

    samples.push({
      diveId,
      timestampSeconds: time,
      depthMeters: Math.max(0, Number(depth.toFixed(1))),
      temperatureCelsius: Number((surfaceTemperature - depth * 0.12).toFixed(1)),
      pressureBar: Math.round(startPressure - (startPressure - endPressure) * normalizedTime),
    });
  }

  if (samples.at(-1)?.timestampSeconds !== duration) {
    samples.push({
      diveId,
      timestampSeconds: duration,
      depthMeters: 0,
      temperatureCelsius: surfaceTemperature,
      pressureBar: endPressure,
    });
  }
  return samples;
}

export const createMockProfile = generateMockProfile;
