"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md' // e.g. max-w-sm, max-w-lg, max-w-2xl
}) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60 p-4 animate-in fade-in duration-200">
      <div 
        className={`relative w-full ${maxWidth} bg-surface border border-border shadow-xl rounded-2xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button 
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-background"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Content */}
        <div className="px-6 py-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
