import { db } from '../db';
import type { DiveProfileSample } from '../../modules/dives/domain/dive.model';

export async function getProfileSamples(diveId: string): Promise<DiveProfileSample[]> {
  return db.profileSamples.where('diveId').equals(diveId).sortBy('timestampSeconds');
}

export async function saveProfileSamples(samples: DiveProfileSample[]): Promise<number> {
  return db.profileSamples.bulkAdd(samples);
}

export async function deleteProfileSamples(diveId: string): Promise<void> {
  await db.profileSamples.where('diveId').equals(diveId).delete();
}