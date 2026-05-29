import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-hover border border-transparent',
  secondary: 'bg-secondary text-white hover:opacity-90 border border-transparent',
  outline: 'bg-transparent text-foreground border border-border hover:border-primary hover:text-primary',
  danger: 'bg-danger text-white hover:opacity-90 border border-transparent',
  ghost: 'bg-transparent text-foreground hover:bg-surface border border-transparent',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const vClass = variantClasses[variant];
  const sClass = sizeClasses[size];
  const wClass = fullWidth ? 'w-full flex justify-center' : 'inline-flex';
  const stateClass = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transition-colors';

  return (
    <button
      className={`items-center gap-2 rounded-lg font-semibold ${vClass} ${sClass} ${wClass} ${stateClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {!isLoading && iconLeft}
      {children}
      {!isLoading && iconRight}
    </button>
  );
}
