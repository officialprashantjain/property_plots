import React from 'react';

export default function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Header section (only renders if title, subtitle, or action is provided) */}
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-foreground leading-none mb-1">{title}</h3>}
            {subtitle && <p className="text-xs text-muted leading-none">{subtitle}</p>}
          </div>
          {action && (
            <div className="shrink-0">{action}</div>
          )}
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
}
