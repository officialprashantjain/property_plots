"use client";

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCcw, Trash2, Edit2, AlertTriangle, Loader2 } from 'lucide-react';
import searchOptionService from '@/services/searchOptionService';
import { Button, Badge, DataTable, Modal, Select, Input } from '@/components/ui';

export default function SearchConfigPage() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ category: 'propertyType', value: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Confirmation Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categoryOptions = [
    { label: 'Property Type', value: 'propertyType' },
    { label: 'Location', value: 'location' },
    { label: 'Price Range', value: 'priceRange' },
    { label: 'Plot Size', value: 'plotSize' }
  ];

  const fetchOptions = async () => {
    try {
      const data = await searchOptionService.getAll();
      let allOptions = [];
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          if (Array.isArray(data[key])) {
            allOptions = [...allOptions, ...data[key]];
          }
        });
      }
      setOptions(allOptions);
    } catch (err) {
      console.error('Failed to fetch search options:', err);
      setError('Failed to fetch search options. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // --- Add / Edit Modal ---
  const handleOpenModal = (opt = null) => {
    setFormError(null);
    if (opt) {
      setEditingId(opt._id);
      setFormData({ category: opt.category, value: opt.value });
    } else {
      setEditingId(null);
      setFormData({ category: 'propertyType', value: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ category: 'propertyType', value: '' });
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      setSubmitting(true);
      if (editingId) {
        await searchOptionService.update(editingId, { value: formData.value });
      } else {
        await searchOptionService.create(formData);
      }
      handleCloseModal();
      setIsLoading(true);
      fetchOptions();
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(err.response?.data?.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete Confirmation Modal ---
  const handleOpenDeleteModal = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await searchOptionService.delete(deletingId);
      handleCloseDeleteModal();
      setIsLoading(true);
      fetchOptions();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete option.');
      handleCloseDeleteModal();
      setIsLoading(false);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (row) => {
        let label = row.category;
        let color = 'primary';
        switch(row.category) {
          case 'propertyType': label = 'Property Type'; color = 'primary'; break;
          case 'location': label = 'Location'; color = 'success'; break;
          case 'priceRange': label = 'Price Range'; color = 'warning'; break;
          case 'plotSize': label = 'Plot Size'; color = 'info'; break;
        }
        return <Badge color={color} text={label} />;
      }
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-foreground">{row.value}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-24',
      align: 'right',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenModal(row); }}
            className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row._id); }}
            className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Configuration</h1>
          <p className="text-muted text-sm mt-1">Manage global search filter options</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => { setIsLoading(true); setError(null); fetchOptions(); }} 
            disabled={isLoading}
            iconLeft={<RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button 
            iconLeft={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Add Option
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-semibold px-2 py-1 hover:bg-danger/10 rounded">
            Dismiss
          </button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={options}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="Search options..."
        searchKeys={['category', 'value']}
        sortable={true}
        paginated={true}
        pageSize={10}
        emptyMessage="No search options found. Add your first global option."
        emptyIcon="🔍"
        className="w-full shadow-sm"
        tableMaxHeight="max-h-[400px] sm:max-h-[500px] md:max-h-[calc(100vh-320px)] xl:max-h-[calc(100vh-280px)]"
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Option" : "Add Search Option"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {formError && (
            <div className="bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-lg text-sm">
              {formError}
            </div>
          )}
          
          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={!!editingId}
            required
          />

          <Input
            label="Value"
            placeholder="e.g. 1000 - 2000 sqft"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-3 mt-2">
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} iconLeft={submitting ? <Loader2 size={16} className="animate-spin" /> : null}>
              {submitting ? 'Saving...' : 'Save Option'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Option"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={28} className="text-danger" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base">Are you sure?</p>
            <p className="text-muted text-sm mt-1">This search option will be permanently deleted and cannot be undone.</p>
          </div>
          <div className="flex items-center justify-center gap-3 w-full mt-2">
            <Button variant="outline" className="flex-1" onClick={handleCloseDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleConfirmDelete} disabled={deleting} iconLeft={deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
