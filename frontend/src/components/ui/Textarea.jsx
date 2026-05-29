import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  rows = 4,
  className = '',
  id,
  ...props
}, ref) => {
  const uid = id || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={uid} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <textarea
        id={uid}
        ref={ref}
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 transition-colors placeholder:text-muted-dark resize-y
          ${error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
