"use client";

import React from 'react';
import AgentForm from '@/components/agents/AgentForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditAgentPage() {
  const { id } = useParams();

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
        <h1 className="text-2xl font-bold text-foreground">Edit Agent</h1>
        <p className="text-muted text-sm">Update agent information and profile picture</p>
      </div>

      <AgentForm mode="edit" agentId={id} />
    </div>
  );
}
