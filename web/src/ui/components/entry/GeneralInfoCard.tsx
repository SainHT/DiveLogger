import { BaseInput } from "../common/BaseInput";
import { FormSection } from "./EntryFormPrimitives";
import type { FormState } from "../../hooks/useDiveEntry";

export function GeneralInfoCard({ form, set }: { form: FormState; set: (key: keyof FormState, value: string | undefined) => void }) {
  return <FormSection title="General information"><div className="form-grid mobile-layout">
    <BaseInput className="mobile-half" label="Dive number" type="number" placeholder="e.g. 200" value={form.diveNumber} onChange={(e) => set("diveNumber", e.target.value)} required />
    <BaseInput className="mobile-half" label="Dive date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
    <BaseInput className="mobile-full" label="Buddy" placeholder="e.g. Buddy Name" value={form.buddy} onChange={(e) => set("buddy", e.target.value)} />
    <BaseInput className="mobile-full" label="Site name" placeholder="e.g. Blue Hole" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} required />
    <BaseInput className="mobile-full" label="Location" placeholder="e.g. Dahab, Egypt" value={form.location} onChange={(e) => set("location", e.target.value)} required />
    <BaseInput className="mobile-full" label="Dive type" placeholder="e.g. Shore, Night" value={form.diveType} onChange={(e) => set("diveType", e.target.value)} />
  </div></FormSection>;
}
