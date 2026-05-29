"use client";

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCcw, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react';
import propertyService from '@/services/propertyService';
import { Button, Badge, DataTable, Modal } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);



  const fetchProperties = async () => {
    try {
      const data = await propertyService.getAll({ page: 1, limit: 200 });
      const items = Array.isArray(data) ? data : data.properties || data.data || [];
      setProperties(items);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to fetch properties. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await propertyService.remove(deleteTarget.id);
      setDeleteTarget(null);
      setIsLoading(true);
      fetchProperties();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete property. Please try again.');
    } finally {
      setDeleting(false);
    }
  };
    useEffect(() => {
    fetchProperties();
  }, []);

  const columns = [
    // {
    //   key: 'select',
    //   label: <input type="checkbox" className="rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" aria-label="Select all rows" />,
    //   width: 'w-10',
    //   sortable: false,
    //   render: (row) => (
    //     <input 
    //       type="checkbox" 
    //       className="rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0" 
    //       aria-label={`Select ${row.title}`}
    //       onClick={(e) => e.stopPropagation()}
    //     />
    //   ),
    // },
    {
      key: 'image',
      label: 'Image',
      width: 'w-16',
      sortable: false,
      render: (row) => (
        <div className="w-10 h-10 rounded-md overflow-hidden bg-border/50 shrink-0 flex items-center justify-center border border-border/60">
          {row.media?.primaryImage ? (
            <img 
              src={row.media.primaryImage} 
              alt={row.title || 'Property'} 
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
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <div className="font-semibold text-foreground max-w-[220px] truncate" title={row.title}>
          {row.title || 'Untitled Property'}
        </div>
      )
    },
    {
      key: 'propertyType',
      label: 'Type',
      sortable: true,
      render: (row) => (
        <span className="capitalize text-muted-dark font-medium">
          {row.propertyType || 'N/A'}
        </span>
      )
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (row) => (
        <div className="max-w-[180px] truncate text-muted-dark" title={row.location}>
          {row.location || 'Unknown'}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => {
        let display = 'N/A';
        if (row.priceRange) {
          display = row.priceRange;
        } else if (row.price != null) {
          display = `$${row.price.toLocaleString()}`;
        }
        return <span className="font-medium text-foreground">{display}</span>;
      }
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (row) => {
        let display = 'N/A';
        if (row.plotSize) {
          display = row.plotSize;
        } else if (row.area != null) {
          display = `${row.area} sqft`;
        }
        return <span className="text-muted-dark">{display}</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const s = (row.status || 'draft').toLowerCase();
        let color = 'neutral';
        if (s === 'active') color = 'success';
        else if (s === 'sold') color = 'danger';
        else if (s === 'draft') color = 'warning';
        
        return <Badge color={color} text={s.toUpperCase()} dot />;
      }
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
              title="Edit Property"
              onClick={() => router.push(`/properties/edit/${id}`)}
              className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              title="Delete Property"
              onClick={() => setDeleteTarget({ id, title: row.title || 'this property' })}
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
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-muted text-sm mt-1">Manage all property listings and details</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetchProperties();
            }} 
            disabled={isLoading}
            iconLeft={<RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />}
          >
            Refresh
          </Button>
          <Button 
            iconLeft={<Plus size={18} />}
            onClick={() => router.push('/properties/create')}
          >
            Add Property
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
        data={properties}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="Search title, location or type..."
        searchKeys={['title', 'location', 'propertyType', 'status']}
        sortable={true}
        paginated={true}
        pageSize={10}
        pageSizeOptions={[10, 25, 50]}
        emptyMessage="No properties found. Add a new one to get started."
        emptyIcon="🏢"
        className="w-full shadow-sm"
        tableMaxHeight="max-h-[400px] sm:max-h-[500px] md:max-h-[calc(100vh-320px)] xl:max-h-[calc(100vh-280px)]"
        onRowClick={(row) => {
          const id = row.id || row._id;
          if (id) {
            router.push(`/properties/view/${id}`);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Property"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-muted mb-6 text-center">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-foreground">{deleteTarget?.title}</span>?{' '}
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            iconLeft={<Trash2 size={15} />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
