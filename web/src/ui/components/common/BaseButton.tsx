import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function BaseButton({ children, variant = 'primary', className = '', ...props }: BaseButtonProps) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}