import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export default function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="flex w-full flex-col space-y-2">
      {label && <span className="text-sm text-slate-300">{label}</span>}
      <select
        className={clsx(
          'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600/40',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
