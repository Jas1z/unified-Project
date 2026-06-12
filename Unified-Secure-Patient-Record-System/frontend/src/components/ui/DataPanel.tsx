import type { ReactNode } from 'react';

interface DataPanelProps {
  children: ReactNode;
  className?: string;
}

/** White card shell for tables and list blocks */
export function DataPanel({ children, className = '' }: DataPanelProps) {
  return (
    <div className={`data-panel ${className}`}>
      {children}
    </div>
  );
}

interface DataPanelEmptyProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export function DataPanelEmpty({ icon, title, subtitle }: DataPanelEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-slate-400 px-4">
      {icon && <div className="mb-4 opacity-30">{icon}</div>}
      <p className="text-base sm:text-lg font-bold text-slate-900 text-center">{title}</p>
      {subtitle && <p className="text-sm mt-1 text-center">{subtitle}</p>}
    </div>
  );
}
