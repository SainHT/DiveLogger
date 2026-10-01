export interface ProfileSample {
  id?: number;
  diveId: string;
  timestampSeconds: number;
  depthMeters: number;
  temperatureCelsius?: number;
  pressureBar?: number;
}