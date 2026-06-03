"use client";

import React, { useState, useEffect } from "react";
import { Menu, Search, Bell, Mail, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import contactService from "@/services/contactService";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopHeader({ title = "", onMenuClick }) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentInquiries, setRecentInquiries] = useState([]);

  const fetchNotifications = async () => {
    try {
      const { count } = await contactService.getUnreadCount();
      setUnreadCount(count);
      
      if (count > 0) {
        const { contacts } = await contactService.getAll({ page: 1, limit: 5, isRead: false });
        setRecentInquiries(contacts || []);
      } else {
        setRecentInquiries([]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await contactService.markAllRead();
      setUnreadCount(0);
      setRecentInquiries([]);
      setShowNotifications(false);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-surface border-b border-border px-4 md:px-6 py-4 flex items-center justify-between shrink-0 gap-4 relative z-50">
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

        {/* Notification & Admin Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition-colors relative ${
                showNotifications ? "bg-primary/10 text-primary" : "text-muted-dark hover:bg-border/40 hover:text-foreground"
              }`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface/50 backdrop-blur-md">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {unreadCount} NEW
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {recentInquiries.length > 0 ? (
                      recentInquiries.map((inquiry) => (
                        <div
                          key={inquiry.id}
                          onClick={() => {
                            setShowNotifications(false);
                            router.push(`/inquiries/view/${inquiry.id}`);
                          }}
                          className="px-5 py-4 hover:bg-border/20 cursor-pointer transition-colors border-b border-border/50 last:border-0 group"
                        >
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                              <Mail size={18} />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-foreground truncate">
                                  {inquiry.name}
                                </span>
                                <span className="text-[10px] text-muted-dark whitespace-nowrap flex items-center gap-1 font-medium uppercase tracking-tight">
                                  <Clock size={10} />
                                  {new Date(inquiry.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-dark line-clamp-2 leading-relaxed">
                                {inquiry.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover border border-border text-muted font-bold uppercase tracking-widest">
                                  {inquiry.inquiryType || "Inquiry"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-border/20 flex items-center justify-center text-muted-dark/40">
                          <Bell size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">All caught up!</p>
                          <p className="text-xs text-muted-dark mt-1">You have no unread inquiries at the moment.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/inquiries"
                    onClick={() => setShowNotifications(false)}
                    className="px-5 py-3 border-t border-border flex items-center justify-center text-xs font-bold text-muted-dark hover:text-primary transition-colors bg-surface/30 group"
                  >
                    View All Inquiries
                    <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Admin Avatar */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm sm:text-base font-bold cursor-pointer shrink-0 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
