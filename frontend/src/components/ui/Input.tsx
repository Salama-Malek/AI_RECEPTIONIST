import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col space-y-2">
      {label && <span className="text-sm text-slate-300">{label}</span>}
      <input
        className={clsx(
          'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-600/40',
          className,
        )}
        {...props}
      />
    </label>
  );
}
