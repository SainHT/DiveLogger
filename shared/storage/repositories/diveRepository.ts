import { db } from '../db';
import type { DiveLog } from '../../modules/dives/domain/dive.model';

export type NewDiveLog = Omit<DiveLog, 'id' | 'updatedAt' | 'isSynced' | 'isDeleted'>;

export async function getAllDives(): Promise<DiveLog[]> {
  const dives = await db.dives
    .filter((dive) => !dive.isDeleted)
    .sortBy('date');

  return dives.reverse();
}

export function getDiveById(id: string): Promise<DiveLog | undefined> {
  return db.dives.get(id);
}

export async function createDive(dive: NewDiveLog): Promise<string> {
  const record: DiveLog = {
    ...dive,
    id: crypto.randomUUID(),
    updatedAt: Date.now(),
    isSynced: false,
    isDeleted: false,
  };

  await db.dives.add(record);
  return record.id;
}

export async function updateDive(id: string, updates: Partial<DiveLog>): Promise<number> {
  const { id: _ignoredId, updatedAt: _ignoredUpdatedAt, ...safeUpdates } = updates;
  return db.dives.update(id, {
    ...safeUpdates,
    updatedAt: Date.now(),
    isSynced: false,
  });
}

export function deleteDive(id: string): Promise<number> {
  return db.dives.update(id, {
    isDeleted: true,
    updatedAt: Date.now(),
    isSynced: false,
  });
}