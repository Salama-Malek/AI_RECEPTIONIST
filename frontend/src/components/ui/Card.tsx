import { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export default function Card({ title, children, className, actions }: CardProps) {
  return (
    <div className={clsx('card p-5', className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between">
          {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : <div />}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
