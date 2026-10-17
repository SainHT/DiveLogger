import type { ReactNode } from "react";

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="form-section"><h2>{title}</h2>{children}</section>;
}

export function SelectField({
  label, value, options, onChange, className = "",
}: {
  label: string; value: string; options: string[]; onChange: (value: string) => void; className?: string;
}) {
  return <label className={`field ${className}`}>
    <span className="field-label">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </label>;
}
