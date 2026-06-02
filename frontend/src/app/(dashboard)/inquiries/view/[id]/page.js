"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  Home, 
  Info,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import contactService from '@/services/contactService';
import { Button, Card, Badge, Modal } from '@/components/ui';

export default function ViewInquiryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchInquiry() {
      try {
        const data = await contactService.getById(id);
        setInquiry(data);
      } catch (err) {
        console.error('Failed to fetch inquiry:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInquiry();
  }, [id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await contactService.remove(id);
      router.push('/inquiries');
    } catch (err) {
      console.error('Delete error:', err);
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      setUpdatingStatus(true);
      const newStatus = inquiry.status === 'active' ? 'inactive' : 'active';
      const updated = await contactService.updateStatus(id, newStatus);
      setInquiry(updated);
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted text-lg">Inquiry not found</p>
        <Link href="/inquiries">
          <Button>Back to Inquiries</Button>
        </Link>
      </div>
    );
  }

  const creationDate = new Date(inquiry.createdAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link 
            href="/inquiries" 
            className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors w-fit"
          >
            <ChevronLeft size={14} />
            Back to Inquiries
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Inquiry Details</h1>
            {!inquiry.isRead && (
              <Badge color="primary" text="NEW" dot />
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleStatusToggle}
            isLoading={updatingStatus}
            className="flex items-center gap-2"
          >
            {inquiry.status === 'active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            {inquiry.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sender Card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {inquiry.name[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-foreground">{inquiry.name}</h2>
                <Badge 
                  color={inquiry.status === 'active' ? 'success' : 'neutral'} 
                  text={inquiry.status?.toUpperCase()} 
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-dark">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="truncate" title={inquiry.email}>{inquiry.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-dark">
                <Phone size={16} className="text-primary shrink-0" />
                <span>{inquiry.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-dark border-t border-border pt-4 mt-2">
                <Clock size={16} className="text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted font-bold uppercase tracking-tight">Received On</span>
                  <span className="text-xs leading-relaxed">{creationDate}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Inquiry Specs */}
          <Card className="p-6 flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-dark border-b pb-2">
              Request Details
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Info size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted font-bold uppercase">Inquiry Type</span>
                  <span className="text-sm text-foreground font-medium">{inquiry.inquiryType || 'General Inquiry'}</span>
                </div>
              </div>
              {inquiry.propertyType && (
                <div className="flex items-start gap-3">
                  <Home size={16} className="text-primary mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted font-bold uppercase">Property Type</span>
                    <span className="text-sm text-foreground font-medium">{inquiry.propertyType}</span>
                  </div>
                </div>
              )}
              {inquiry.preferredLocation && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted font-bold uppercase">Location</span>
                    <span className="text-sm text-foreground font-medium">{inquiry.preferredLocation}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Message Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-4 min-h-[300px]">
            <div className="flex items-center gap-2 border-b border-border pb-3 mb-2">
              <MessageSquare size={17} className="text-primary" />
              <h3 className="font-bold text-foreground">Message Content</h3>
            </div>
            <div className="text-sm text-muted-dark leading-relaxed whitespace-pre-wrap bg-background/50 p-5 rounded-xl border border-border/40">
              {inquiry.message}
            </div>
          </Card>

          {/* Reply Quick Info */}
          {/* <Card className="p-6 bg-primary/5 border-primary/10">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-primary">Response Tip</h4>
                <p className="text-xs text-muted-dark leading-relaxed">
                  Always mention the <strong>{inquiry.inquiryType || 'request'}</strong> and the specific <strong>{inquiry.propertyType || 'property'}</strong> preferences when replying to <strong>{inquiry.name}</strong>.
                </p>
              </div>
            </div>
          </Card> */}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Inquiry"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Message
            </Button>
          </div>
        }
      >
        <p className="text-foreground text-sm">
          Are you sure you want to delete the message from <span className="font-bold">{inquiry.name}</span>? 
          This action is permanent and cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
