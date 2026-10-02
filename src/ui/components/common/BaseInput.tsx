import type { InputHTMLAttributes } from 'react';

type BaseInputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string };

export function BaseInput({ label, id, className = '', ...props }: BaseInputProps) {
  return <label className={`field ${className}`} htmlFor={id}>
    {label && <span className="field-label">{label}</span>}
    <input id={id} {...props} />
  </label>;
}