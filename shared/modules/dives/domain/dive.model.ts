export type RecreationalGas = 'AIR' | 'EAN32' | 'EAN36';
export type WaterType = 'Salt' | 'Fresh' | 'Brackish';

export interface DiveLog {
  id: string;                           // UUID v4
  diveNumber: number;                   // Sequential dive number
  date: string;                         // ISO 8601 string (YYYY-MM-DD)
  waterType?: WaterType;
  location: string;                     // e.g., "Red Sea, Egypt"
  siteName: string;                     // e.g., "Ras Mohammed"
  diveType: string;                     // e.g., "Shore", "Boat", "Night", "Drift", "Decoo", "Cave"
  startTime?: number;                   // as (hh:mm) wth the time being stored in minutes
  duration: number;                     // as(mm:ss) with the time being stored in seconds
  endTime?: number;                     // as (hh:mm) wth the time being stored in minutes
  diveStart?: string;                   // HH:mm
  diveEnd?: string;                     // HH:mm
  buddy?: string;                       // Buddy name(s)

  // Depth & Gas (Metric)
  maxDepthMeters: number;               
  avgDepthMeters?: number;              
  gasMix: RecreationalGas;
  startPressureBar: number;             
  endPressureBar: number;               
  tankCapacityLiters?: number;          
  tankType: 'Single' | 'Doubles' | 'Sidemount' | 'Rebreather' | 'Other';

  // Gear & Weighting
  weightKg: number;                     
  suitType?: 'Shorty' | '3mm' | '5mm' | '7mm' | 'Semi-Dry' | 'Drysuit';
  specialEquipment?: string;            // e.g., "DSMB, DPV, Camera"

  // Environmental
  maxWaterTempCelsius?: number;
  minWaterTempCelsius?: number;
  avgWaterTempCelsius?: number;
  visibilityMeters?: number;
  weather?: string;                      // e.g., "Sunny", "Overcast"
  specialConditions?: string;            // e.g., "Strong Current, Surge"

  // Personal Notes & Rating
  notes?: string;
  rating?: number;                      // 1 to 5 stars

  // Local-First Sync Metadata
  updatedAt: number;                    // Date.now() timestamp
  isSynced: boolean;                    // Default: false
  isDeleted: boolean;                    // Soft delete flag
}

export type DiveProfileSample = ProfileSample;
import type { ProfileSample } from '../../telemetry/domain/profile.model';
