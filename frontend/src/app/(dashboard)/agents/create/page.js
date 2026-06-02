"use client";

import React from 'react';
import AgentForm from '@/components/agents/AgentForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateAgentPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/agents" 
          className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={14} />
          Back to Agents
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add New Agent</h1>
        <p className="text-muted text-sm">Create a new agent profile for your website</p>
      </div>

      <AgentForm mode="add" />
    </div>
  );
}
