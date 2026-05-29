import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  options = [],
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
      <select
        id={uid}
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 transition-colors appearance-none
          ${error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary'}
        `}
        {...props}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
