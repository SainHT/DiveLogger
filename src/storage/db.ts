import Dexie, { type Table } from 'dexie';
import type { DiveLog, DiveProfileSample } from '../modules/dives/domain/dive.model';

export class LocalDiveDatabase extends Dexie {
  dives!: Table<DiveLog, string>;
  profileSamples!: Table<DiveProfileSample, number>;

  constructor() {
    super('LocalDiveLogDB');
    this.version(1).stores({
      dives: 'id, diveNumber, date, gasMix, updatedAt, isSynced',
      profileSamples: '++id, diveId, timestampSeconds',
    });
  }
}

export const db = new LocalDiveDatabase();