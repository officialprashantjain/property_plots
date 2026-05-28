"use client";

export default function TopHeader({ title = "Dashboard" }) {
  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex items-center gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary w-56"
        />
        {/* Admin Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
}
