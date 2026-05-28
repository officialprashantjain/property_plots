"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    group: "Main",
    links: [
      { label: "Dashboard", href: "/", icon: "⊞" },
      { label: "Properties", href: "/properties", icon: "🏠" },
    ],
  },
  {
    group: "CMS",
    links: [
      { label: "Home Page", href: "/cms/homepage", icon: "🗂" },
      { label: "Header", href: "/cms/header", icon: "↑" },
      { label: "Footer", href: "/cms/footer", icon: "↓" },
      { label: "Blogs", href: "/cms/blogs", icon: "📝" },
    ],
  },
  {
    group: "System",
    links: [
      { label: "Settings", href: "/settings", icon: "⚙" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-sidebar-bg text-sidebar-text flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          Dot <span className="text-secondary">Properties</span>
        </span>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-6 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 px-2 mb-2">
              {group.group}
            </p>
            {group.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-sidebar-text hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom logout area */}
      <div className="px-3 py-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-text hover:bg-white/10 hover:text-white transition-colors w-full">
          <span>↩</span> Logout
        </button>
      </div>
    </aside>
  );
}
