import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  iconLeft,
  type = 'text',
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
      <div className="relative">
        {iconLeft && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-dark">
            {iconLeft}
          </div>
        )}
        <input
          id={uid}
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-foreground focus:outline-none focus:ring-2 transition-colors placeholder:text-muted-dark
            ${iconLeft ? 'pl-10' : ''}
            ${error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
