import Dexie, { type Table } from 'dexie';
import type { DiveLog, DiveProfileSample } from '../modules/dives/domain/dive.model';
import { seedPresets, type EquipmentPreset } from '../modules/equipment/domain/preset.model';

export class LocalDiveDatabase extends Dexie {
  dives!: Table<DiveLog, string>;
  profileSamples!: Table<DiveProfileSample, number>;
  presets!: Table<EquipmentPreset, string>;

  constructor() {
    super('LocalDiveLogDB');
    this.version(1).stores({
      dives: 'id, diveNumber, date, gasMix, updatedAt, isSynced',
      profileSamples: '++id, diveId, timestampSeconds',
    });
    this.version(2).stores({
      dives: 'id, diveNumber, date, gasMix, updatedAt, isSynced',
      profileSamples: '++id, diveId, timestampSeconds',
      presets: 'id, name, updatedAt',
    });
    this.version(3).stores({
      dives: 'id, diveNumber, date, gasMix, waterType, updatedAt, isSynced',
      profileSamples: '++id, diveId, timestampSeconds',
      presets: 'id, name, updatedAt',
    });
    this.on('populate', (transaction) => transaction.table('presets').bulkAdd(seedPresets));
  }
}

export const db = new LocalDiveDatabase();