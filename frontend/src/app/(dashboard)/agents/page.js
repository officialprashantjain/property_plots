"use client";

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCcw, Image as ImageIcon, Pencil, Trash2, Users, X } from 'lucide-react';
import agentService from '@/services/agentService';
import { Button, Badge, DataTable, Modal } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const data = await agentService.getAll({ page: 1, limit: 100 });
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError('Failed to fetch agents. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await agentService.remove(deleteTarget.id);
      setDeleteTarget(null);
      fetchAgents();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete agent. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const columns = [
    {
      key: 'image',
      label: 'Image',
      width: 'w-16',
      sortable: false,
      render: (row) => (
        <div className="w-10 h-10 rounded-md overflow-hidden bg-border/50 shrink-0 flex items-center justify-center border border-border/60">
          {row.image ? (
            <img 
              src={row.image} 
              alt={row.name} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <ImageIcon size={18} className="text-muted-dark opacity-40" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div className="font-semibold text-foreground truncate" title={row.name}>
          {row.name}
        </div>
      )
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
      render: (row) => (
        <span className="text-muted-dark font-medium">
          {row.designation}
        </span>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (row) => (
        <span className="text-muted-dark">
          {row.phone || 'N/A'}
        </span>
      )
    },
    // {
    //   key: 'order',
    //   label: 'Order',
    //   sortable: true,
    //   width: 'w-20',
    //   render: (row) => (
    //     <span className="text-muted-dark font-medium">
    //       {row.order}
    //     </span>
    //   )
    // },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      width: 'w-32',
      render: (row) => (
        <Badge 
          color={row.isActive ? 'success' : 'neutral'} 
          text={row.isActive ? 'ACTIVE' : 'INACTIVE'} 
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
              title="Edit Agent"
              onClick={() => router.push(`/agents/edit/${id}`)}
              className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              title="Delete Agent"
              onClick={() => setDeleteTarget({ id, name: row.name })}
              className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={15} />
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
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-muted text-sm mt-1">Manage all agents and their contact details</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchAgents}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push('/agents/create')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Agent
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto font-bold">&times;</button>
        </div>
      )}

      {/* Agents Table */}
      <DataTable
        columns={columns}
        data={agents}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/agents/view/${row.id || row._id}`)}
        emptyMessage="No agents found. Click 'Add Agent' to create one."
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Agent"
        footer={
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteTarget(null)} 
              disabled={deleting}
              iconLeft={<X size={16} />}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete} 
              isLoading={deleting}
              iconLeft={<Trash2 size={16} />}
            >
              Delete Agent
            </Button>
          </div>
        }
      >
        <p className="text-foreground">
          Are you sure you want to delete <span className="font-bold">{deleteTarget?.name}</span>? 
          This action cannot be undone and the agent's image will also be removed.
        </p>
      </Modal>
    </div>
  );
}
