import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  iconLeft?: ReactNode;
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  iconLeft,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-foreground';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 focus:ring-slate-500',
    ghost: 'bg-transparent text-slate-200 hover:bg-slate-800 focus:ring-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const sizes: Record<typeof size, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {iconLeft ? <span className="mr-2">{iconLeft}</span> : null}
      {children}
    </button>
  );
}
