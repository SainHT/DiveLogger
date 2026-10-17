import { ArrowLeft, Save } from "lucide-react";
import type { DiveLog } from "@scuba-log/shared/modules/dives/domain/dive.model";
import { BaseButton } from "../components/common/BaseButton";
import { GeneralInfoCard } from "../components/entry/GeneralInfoCard";
import { TelemetryGasCard } from "../components/entry/TelemetryGasCard";
import { GearEnvironmentCard } from "../components/entry/GearEnvironmentCard";
import { NotesRatingCard } from "../components/entry/NotesRatingCard";
import { useDiveEntry } from "../hooks/useDiveEntry";

export function DiveEntryView({
  nextNumber,
  editingDive,
  onCancel,
  onSaved,
}: {
  nextNumber: number;
  editingDive?: DiveLog;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const entry = useDiveEntry(nextNumber, editingDive);
  const save = async (event: React.FormEvent) => {
    if (await entry.submit(event)) onSaved();
  };

  return (
    <div className="page-stack">
      <button className="back-link" onClick={onCancel}>
        <ArrowLeft size={16} /> Cancel and go back
      </button>
      <section className="page-heading">
        <div>
          <span className="eyebrow">LOGBOOK / {editingDive ? "EDIT ENTRY" : "NEW ENTRY"}</span>
          <h1>{editingDive ? "Update your dive." : "Log a new dive."}</h1>
          <p className="muted">Capture the details while they are fresh.</p>
        </div>
      </section>
      <form className="entry-form" onSubmit={save}>
        <GeneralInfoCard form={entry.form} set={entry.set} />
        <TelemetryGasCard form={entry.form} set={entry.set} setTime={entry.setTime} mod={entry.mod} consumption={entry.consumption} />
        <GearEnvironmentCard
          form={entry.form}
          set={entry.set}
          applyPreset={entry.applyPreset}
          selectedPresetId={entry.selectedPresetId}
          isCustom={entry.isCustom}
          saveAsPreset={entry.saveAsPreset}
          setSaveAsPreset={entry.setSaveAsPreset}
        />
        <NotesRatingCard form={entry.form} set={entry.set} setRating={entry.setRating} />
        {entry.error && <p className="form-error">{entry.error}</p>}
        <div className="form-actions">
          <BaseButton variant="secondary" type="button" onClick={onCancel}>Cancel</BaseButton>
          <BaseButton type="submit" disabled={entry.saving}>
            <Save size={17} />{" "}
            {entry.saving ? "Saving..." : editingDive ? "Update dive" : "Save dive"}
          </BaseButton>
        </div>
      </form>
    </div>
  );
}
