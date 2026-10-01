export type RecreationalGas = 'AIR' | 'EAN32' | 'EAN36';

export interface DiveLog {
  id: string;
  diveNumber: number;
  date: string;
  location: string;
  siteName: string;
  diveType: string;
  startTime?: number;
  duration: number;
  endTime?: number;
  buddy?: string;
  maxDepthMeters: number;
  avgDepthMeters?: number;
  gasMix: RecreationalGas;
  startPressureBar: number;
  endPressureBar: number;
  tankCapacityLiters?: number;
  weightKg: number;
  tankType: 'Single' | 'Doubles' | 'Sidemount' | 'Rebreather' | 'Other';
  suitType?: 'Shorty' | '3mm' | '5mm' | '7mm' | 'Semi-Dry' | 'Drysuit';
  specialEquipment?: string;
  maxWaterTempCelsius?: number;
  minWaterTempCelsius?: number;
  avgWaterTempCelsius?: number;
  visibilityMeters?: number;
  weather?: string;
  specialConditions?: string;
  notes?: string;
  rating?: number;
  updatedAt: number;
  isSynced: boolean;
  isDeleted: boolean;
}

export interface DiveProfileSample {
  id?: number;
  diveId: string;
  timestampSeconds: number;
  depthMeters: number;
  pressureBar?: number;
}