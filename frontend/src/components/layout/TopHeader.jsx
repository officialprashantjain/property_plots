"use client";

import { Menu, Search } from "lucide-react";

export default function TopHeader({ title = "Dashboard", onMenuClick }) {
  return (
    <header className="bg-surface border-b border-border px-4 md:px-6 py-4 flex items-center justify-between shrink-0 gap-4">
      <div className="flex items-center gap-3">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-foreground hover:text-primary transition-colors p-1"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search — hidden on very small screens */}
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dark pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary w-48 md:w-56"
          />
        </div>

        {/* Admin Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold cursor-pointer shrink-0">
          A
        </div>
      </div>
    </header>
  );
}
