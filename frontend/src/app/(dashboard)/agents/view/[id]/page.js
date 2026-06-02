"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Pencil, Trash2, Mail, Phone, Globe, User, BadgeCheck, Share2, X, Briefcase, MapPin, Clock, Info, Calendar } from 'lucide-react';
import agentService from '@/services/agentService';
import { Button, Card, Badge, Modal } from '@/components/ui';

export default function ViewAgentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const data = await agentService.getById(id);
        setAgent(data);
      } catch (err) {
        console.error('Failed to fetch agent:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgent();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await agentService.remove(id);
      router.push('/agents');
    } catch (err) {
      console.error('Delete error:', err);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted text-lg">Agent not found</p>
        <Link href="/agents">
          <Button>Back to Agents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link 
            href="/agents" 
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors w-fit"
          >
            <ChevronLeft size={14} />
            Back to Agents
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Agent Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/agents/edit/${id}`)}
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit Profile
          </Button>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 p-6 flex flex-col items-center text-center gap-4 h-fit">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 p-1">
            {agent.image ? (
              <img src={agent.image} alt={agent.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-border/30 flex items-center justify-center text-muted rounded-full">
                <User size={48} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              {agent.name}
              {agent.isActive && <BadgeCheck size={18} className="text-primary" />}
            </h2>
            <p className="text-muted-dark font-medium">{agent.designation}</p>
          </div>
          <Badge 
            color={agent.isActive ? 'success' : 'neutral'} 
            text={agent.isActive ? 'ACTIVE' : 'INACTIVE'} 
            dot 
          />
          <div className="w-full border-t border-border pt-4 mt-2 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-muted-dark">
              <Phone size={16} className="text-primary shrink-0" />
              <span>{agent.phone || 'No phone provided'}</span>
            </div>
            {agent.email && (
              <div className="flex items-center gap-3 text-sm text-muted-dark">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="truncate">{agent.email}</span>
              </div>
            )}
            {/* <div className="flex items-center gap-3 text-sm text-muted-dark">
              <Globe size={16} className="text-primary shrink-0" />
              <span>Order Position: {agent.order}</span>
            </div> */}
          </div>
        </Card>

        {/* Details & Social */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark border-b pb-2 flex items-center gap-2">
                <Briefcase size={14} className="text-primary" /> Professional Info
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted font-bold uppercase">Department</span>
                  <span className="text-sm text-foreground">{agent.department || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted font-bold uppercase">Experience</span>
                  <span className="text-sm text-foreground">{agent.experience || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark border-b pb-2 flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Office Details
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted font-bold uppercase">Working Hours</span>
                  <span className="text-sm text-foreground">{agent.officeHours || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted font-bold uppercase">Address</span>
                  <span className="text-sm text-foreground leading-snug">{agent.officeAddress || 'N/A'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* About Me Section */}
          {agent.aboutMe && (
            <Card className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark border-b pb-2 mb-4 flex items-center gap-2">
                <Info size={14} className="text-primary" /> About {agent.name.split(' ')[0]}
              </h3>
              <p className="text-sm text-muted-dark leading-relaxed whitespace-pre-line">
                {agent.aboutMe}
              </p>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-dark border-b pb-2 mb-6">
              Contact & Social Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <h4 className="text-xs font-bold text-muted uppercase">Social Networks</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600">
                      <Share2 size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted font-bold uppercase">LinkedIn</span>
                      <a href={agent.socialLinks?.linkedin || '#'} target="_blank" className="text-sm text-foreground hover:text-primary transition-colors truncate max-w-[200px]">
                        {agent.socialLinks?.linkedin || 'Not linked'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-700/10 flex items-center justify-center text-blue-700">
                      <Share2 size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted font-bold uppercase">Facebook</span>
                      <a href={agent.socialLinks?.facebook || '#'} target="_blank" className="text-sm text-foreground hover:text-primary transition-colors truncate max-w-[200px]">
                        {agent.socialLinks?.facebook || 'Not linked'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-xs font-bold text-muted uppercase hidden sm:block">&nbsp;</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/10 flex items-center justify-center text-black">
                      <Share2 size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted font-bold uppercase">X (Twitter)</span>
                      <a href={agent.socialLinks?.twitter || '#'} target="_blank" className="text-sm text-foreground hover:text-primary transition-colors truncate max-w-[200px]">
                        {agent.socialLinks?.twitter || 'Not linked'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-600/10 flex items-center justify-center text-pink-600">
                      <Share2 size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted font-bold uppercase">Instagram</span>
                      <a href={agent.socialLinks?.instagram || '#'} target="_blank" className="text-sm text-foreground hover:text-primary transition-colors truncate max-w-[200px]">
                        {agent.socialLinks?.instagram || 'Not linked'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/10">
            <h3 className="text-sm font-bold text-primary mb-2">Internal Note</h3>
            <p className="text-sm text-muted-dark leading-relaxed">
              This agent profile is currently <strong>{agent.isActive ? 'visible' : 'hidden'}</strong> on the public website. 
              The display priority is set to <strong>{agent.order}</strong>. You can change these settings by clicking the edit button above.
            </p>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Agent"
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)} 
              disabled={isDeleting}
              iconLeft={<X size={16} />}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete} 
              isLoading={isDeleting}
              iconLeft={<Trash2 size={16} />}
            >
              Delete Agent
            </Button>
          </div>
        }
      >
        <p className="text-foreground">
          Are you sure you want to delete <span className="font-bold">{agent.name}</span>? 
          This action will permanently remove the agent and their profile image.
        </p>
      </Modal>
    </div>
  );
}
