"use client";

import React, { useState, useEffect } from 'react';
import dashboardService from '@/services/dashboardService';
import { Eye, ArrowRight, User, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalAgents: 0,
    totalInquiries: 0,
    recentInquiries: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { label: "Total Properties", value: stats.totalProperties, color: "text-primary" },
    { label: "Active Agents", value: stats.totalAgents, color: "text-primary" },
    { label: "Total Inquiries", value: stats.totalInquiries, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard Overview</h1>
        <p className="text-muted text-sm">Welcome back, Admin.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-muted mb-1">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>
              {isLoading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-base font-semibold text-foreground">Recent Inquiries</h2>
          <Link 
            href="/inquiries" 
            className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted text-sm">Loading recent inquiries...</div>
          ) : stats.recentInquiries.length > 0 ? (
            stats.recentInquiries.map((inquiry) => (
              <Link 
                key={inquiry.id} 
                href={`/inquiries/view/${inquiry.id}`}
                className="block p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {inquiry.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{inquiry.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {inquiry.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> 
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                      {inquiry.inquiryType || 'General'}
                    </span>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-muted text-sm">No recent inquiries found.</div>
          )}
        </div>
      </div>
    </div>
  );
}


