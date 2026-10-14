export type SuitType = 'Shorty' | '3mm' | '5mm' | '7mm' | 'Semi-Dry' | 'Drysuit';
export type TankType = 'Single' | 'Doubles' | 'Sidemount' | 'Rebreather' | 'Other';

export interface EquipmentPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  suitType?: SuitType;
  suitSize?: string;
  bootSize?: string;
  weightKg?: number;
  tankCapacityLiters?: number;
  tankType?: TankType;
  specialEquipment?: string;
  updatedAt: number;
}

export const seedPresets: EquipmentPreset[] = [
  {
    id: 'preset-1',
    name: 'Tropical 3mm Shorty',
    isDefault: true,
    suitType: '3mm',
    suitSize: 'L',
    bootSize: '43 EU',
    weightKg: 4,
    tankCapacityLiters: 12,
    tankType: 'Single',
    specialEquipment: 'DSMB, Safety Whistle',
    updatedAt: 1700000000000,
  },
  {
    id: 'preset-2',
    name: 'Cold Water 7mm Semi-Dry',
    suitType: '7mm',
    suitSize: 'L',
    bootSize: '43 EU',
    weightKg: 8,
    tankCapacityLiters: 15,
    tankType: 'Single',
    specialEquipment: 'DSMB, Primary Torch, Backup Light, Hood, Gloves',
    updatedAt: 1700000000000,
  },
];