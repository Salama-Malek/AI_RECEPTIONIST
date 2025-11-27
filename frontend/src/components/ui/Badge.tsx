import clsx from 'clsx';
import { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'muted';
};

export default function Badge({ children, variant = 'muted' }: BadgeProps) {
  const variants: Record<typeof variant, string> = {
    success: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-100 border-amber-500/30',
    info: 'bg-blue-500/20 text-blue-100 border-blue-500/30',
    danger: 'bg-red-500/20 text-red-100 border-red-500/30',
    muted: 'bg-slate-700/40 text-slate-100 border-slate-600',
  };
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', variants[variant])}>
      {children}
    </span>
  );
}
