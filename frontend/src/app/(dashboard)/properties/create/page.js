"use client";

import React, { useState, useRef } from 'react';
import PropertyForm from '@/components/properties/PropertyForm';
import { Button, Card } from '@/components/ui';
import { Upload, FilePlus, ChevronLeft, FileSpreadsheet, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import propertyService from '@/services/propertyService';

export default function CreatePropertyPage() {
  const router = useRouter();
  const [creationMode, setCreationMode] = useState('single');

  // Bulk upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null); // { success: bool, message: string, count?: number }
  const fileInputRef = useRef(null);

  const ACCEPTED = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    '.csv', '.xls', '.xlsx'
  ];

  const isValidFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ['csv', 'xls', 'xlsx'].includes(ext);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidFile(file)) {
      setBulkFile(file);
      setBulkResult(null);
    } else if (file) {
      setBulkResult({ success: false, message: 'Invalid file type. Please upload a .csv or .xlsx file.' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setBulkFile(file);
      setBulkResult(null);
    }
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setBulkFile(null);
    setBulkResult(null);
  };

  const handleUpload = async () => {
    if (!bulkFile) return;
    setUploading(true);
    setBulkResult(null);
    try {
      const res = await propertyService.bulkUpload(bulkFile);
      setBulkResult({
        success: true,
        message: res.message || 'Upload successful!',
        count: res.count
      });
      setBulkFile(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed. Please check your file and try again.';
      setBulkResult({ success: false, message: msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">

      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <Link href="/properties" className="p-2 hover:bg-surface border border-border rounded-lg text-muted transition-colors shrink-0">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Property</h1>
          <p className="text-muted text-sm mt-1">Create a new real estate listing</p>
        </div>
      </div>

      {/* Mode Toggle Tabs */}
      <div className="flex p-1 bg-surface border border-border rounded-lg w-fit">
        <button
          onClick={() => setCreationMode('single')}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            creationMode === 'single' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
          }`}
        >
          <FilePlus size={16} />
          Single Property
        </button>
        <button
          onClick={() => setCreationMode('bulk')}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            creationMode === 'bulk' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
          }`}
        >
          <Upload size={16} />
          Bulk Upload (.CSV/.XLS)
        </button>
      </div>

      {/* Single Property Form */}
      {creationMode === 'single' && <PropertyForm />}

      {/* Bulk Upload Section */}
      {creationMode === 'bulk' && (
        <Card className="flex flex-col gap-6 p-6 sm:p-10">

          {/* Success / Error Banner */}
          {bulkResult && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm border ${
              bulkResult.success
                ? 'bg-success/10 border-success/20 text-success'
                : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              {bulkResult.success
                ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                : <AlertCircle size={18} className="shrink-0 mt-0.5" />
              }
              <div className="flex-1">
                <p className="font-semibold">{bulkResult.success ? 'Upload Successful!' : 'Upload Failed'}</p>
                <p className="mt-0.5 opacity-90">{bulkResult.message}{bulkResult.count != null ? ` — ${bulkResult.count} properties imported.` : ''}</p>
              </div>
              {bulkResult.success && (
                <button onClick={() => router.push('/properties')} className="underline font-medium whitespace-nowrap">
                  View Properties
                </button>
              )}
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !bulkFile && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all min-h-[280px] cursor-pointer select-none
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border bg-surface hover:border-primary/50 hover:bg-primary/3'}
              ${bulkFile ? 'cursor-default' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />

            {bulkFile ? (
              /* File selected state */
              <div className="flex flex-col items-center gap-3 px-6 py-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet size={32} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-base">{bulkFile.name}</p>
                  <p className="text-xs text-muted mt-1">{(bulkFile.size / 1024).toFixed(1)} KB · Ready to upload</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/10 mt-1"
                >
                  <X size={14} /> Remove file
                </button>
              </div>
            ) : (
              /* Empty / dragging state */
              <div className="flex flex-col items-center gap-3 px-6 py-4 text-center pointer-events-none">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {isDragging ? 'Drop your file here' : 'Drag & Drop your spreadsheet'}
                  </p>
                  <p className="text-sm text-muted mt-1">Accepts <strong>.csv</strong>, <strong>.xls</strong>, and <strong>.xlsx</strong> files</p>
                </div>
                <span className="text-xs text-muted/60 border border-border rounded-full px-4 py-1">or click to browse files</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            {/* <div className="flex gap-4 text-sm">
              <a href="#" className="text-primary hover:underline font-medium">Download CSV Template</a>
              <span className="text-border">|</span>
              <a href="#" className="text-primary hover:underline font-medium">Download Excel Template</a>
            </div> */}
            <Button
              onClick={handleUpload}
              disabled={!bulkFile || uploading}
              iconLeft={uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              className="w-full sm:w-auto"
            >
              {uploading ? 'Uploading...' : 'Upload & Import'}
            </Button>
          </div>

        </Card>
      )}
    </div>
  );
}

