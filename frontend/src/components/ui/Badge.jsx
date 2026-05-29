import React from 'react';

const colorClasses = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-primary/10 text-primary border-primary/20',
};

export default function Badge({ color = 'neutral', text, dot = false, className = '' }) {
  const theme = colorClasses[color] || colorClasses.neutral;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${theme} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${theme.split(' ')[1].replace('text', 'bg')}`}></span>
      )}
      {text}
    </span>
  );
}
