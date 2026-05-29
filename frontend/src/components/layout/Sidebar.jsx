"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  PanelTop, 
  PanelBottom, 
  BookOpen, 
  Settings, 
  LogOut,
  X
} from "lucide-react";

const navItems = [
  {
    group: "Main",
    links: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Properties", href: "/properties", icon: Home },
    ],
  },
  {
    group: "CMS",
    links: [
      { label: "Home Page", href: "/cms/homepage", icon: FileText },
      { label: "Header", href: "/cms/header", icon: PanelTop },
      { label: "Footer", href: "/cms/footer", icon: PanelBottom },
      { label: "Blogs", href: "/cms/blogs", icon: BookOpen },
    ],
  },
  {
    group: "System",
    links: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { logout } = useAuthContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/*
        On desktop (md+): always visible, static in the flex row.
        On mobile: fixed overlay, slides in when isOpen=true, hidden otherwise.
      */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-sidebar-bg text-sidebar-text flex flex-col shrink-0 transition-transform duration-300
        lg:static lg:translate-x-0 lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo + mobile close button */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              <span className="text-secondary">Properties</span>
            </span>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
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
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose} // Close sidebar on nav on mobile
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      isActive
                        ? "bg-sidebar-active text-white"
                        : "text-sidebar-text hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <Icon size={18} />
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom logout area */}
        <div className="px-3 py-4 border-t border-white/10">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-text hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <span className="flex items-center justify-center -ml-0.5"><LogOut size={18} /></span> Logout
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-muted mb-6 text-center">
          Are you sure you want to logout?
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            iconLeft={<LogOut size={16} />}
            onClick={() => {
              setShowLogoutModal(false);
              logout();
            }}
          >
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
