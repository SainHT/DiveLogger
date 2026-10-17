import { useEffect, useMemo, useState } from "react";
import type { DiveLog, DiveProfileSample } from "@scuba-log/shared/modules/dives/domain/dive.model";
import { deleteDive } from "@scuba-log/shared/storage/repositories/diveRepository";
import { getProfileSamples } from "@scuba-log/shared/storage/repositories/profileRepository";
import { calculateSAC } from "@scuba-log/shared/modules/physics/utils/gasCalculations";

export function useDiveDetail(dive: DiveLog, onDeleted: () => void) {
  const [samples, setSamples] = useState<DiveProfileSample[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    void getProfileSamples(dive.id).then(setSamples);
  }, [dive.id]);

  const consumption = useMemo(
    () =>
      calculateSAC({
        startPressureBar: dive.startPressureBar,
        endPressureBar: dive.endPressureBar,
        durationMinutes: dive.duration / 60,
        avgDepthMeters: dive.avgDepthMeters ?? dive.maxDepthMeters,
        tankCapacityLiters: dive.tankCapacityLiters,
      }),
    [dive],
  );

  const remove = async () => {
    await deleteDive(dive.id);
    setConfirmDelete(false);
    onDeleted();
  };

  return {
    samples,
    consumption,
    confirmDelete,
    setConfirmDelete,
    remove,
  };
}
