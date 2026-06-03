"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCcw, Eye, Trash2, Mail, Phone, Calendar, Circle } from 'lucide-react';
import contactService from '@/services/contactService';
import { Button, Badge, DataTable, Modal } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function InquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const data = await contactService.getAll({ 
        page, 
        limit: 10,
        keyword: debouncedKeyword
      });
      setInquiries(data.contacts || []);
      setTotalRows(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setError('Failed to load inquiries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await contactService.remove(deleteTarget.id);
      setDeleteTarget(null);
      fetchInquiries();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete inquiry.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
  }, [page, debouncedKeyword]);

  const columns = [
    {
      key: 'status_dot',
      label: '',
      width: 'w-8',
      render: (row) => (
        !row.isRead ? (
          <div className="flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" title="New Message" />
          </div>
        ) : null
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      width: 'w-40',
      render: (row) => (
        <div className="text-xs text-muted-dark font-medium flex items-center gap-1.5">
          <Calendar size={13} className="opacity-60" />
          {new Date(row.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      )
    },
    {
      key: 'sender',
      label: 'Sender',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5 max-w-[200px]">
          <span className="font-semibold text-foreground truncate">{row.name}</span>
          <span className="text-[11px] text-muted truncate">{row.email}</span>
        </div>
      )
    },
    {
      key: 'inquiryType',
      label: 'Category',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium px-2 py-1 bg-surface-hover rounded-md border border-border/50 text-muted-dark">
          {row.inquiryType || 'General'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: 'w-28',
      render: (row) => (
        <Badge 
          color={row.status === 'active' ? 'success' : 'neutral'} 
          text={row.status?.toUpperCase() || 'ACTIVE'} 
          dot 
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: 'w-24',
      align: 'right',
      render: (row) => {
        const id = row.id || row._id;
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              title="View Inquiry"
              onClick={() => router.push(`/inquiries/view/${id}`)}
              className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Eye size={16} />
            </button>
            <button
              title="Delete Inquiry"
              onClick={() => setDeleteTarget({ id, name: row.name })}
              className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Inquiries</h1>
          <p className="text-muted text-sm mt-1">Manage user messages and property requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchInquiries()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button 
            variant="ghost"
            onClick={() => router.push('/inquiries/config')}
            className="flex items-center gap-2 border border-border"
          >
            Page Config
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-bold">&times;</button>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={inquiries}
        isLoading={isLoading}
        searchable={true}
        serverSide={true}
        totalRows={totalRows}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        searchPlaceholder="Search by name, email, phone or message..."
        onSearch={(query) => { setKeyword(query); setPage(1); }}
        paginated={true}
        pageSize={10}
        onRowClick={(row) => router.push(`/inquiries/view/${row.id || row._id}`)}
        emptyMessage="No inquiries found yet."
      />

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Inquiry"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
              Delete Message
            </Button>
          </div>
        }
      >
        <p className="text-foreground text-sm leading-relaxed">
          Are you sure you want to delete the inquiry from <span className="font-bold">{deleteTarget?.name}</span>? 
          This will permanently remove the message from your records.
        </p>
      </Modal>
    </div>
  );
}
