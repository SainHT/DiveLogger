import { RatingStars } from "../common/RatingStars";
import { FormSection } from "./EntryFormPrimitives";
import type { FormState } from "../../hooks/useDiveEntry";

export function NotesRatingCard({
  form,
  set,
  setRating,
}: {
  form: FormState;
  set: (key: keyof FormState, value: string | undefined) => void;
  setRating: (rating: number) => void;
}) {
  return (
    <FormSection title="Notes and rating">
      <div className="form-grid">
        <label className="field full-field">
          <span className="field-label">Personal notes</span>
          <textarea
            rows={5}
            placeholder="e.g. Calm descent and clear visibility"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </label>
        <div className="field">
          <span className="field-label">Rating</span>
          <RatingStars value={form.rating} interactive onChange={setRating} />
        </div>
      </div>
    </FormSection>
  );
}
