"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, Save, ImageIcon, Loader2, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import contactService from '@/services/contactService';
import { Button, Card, Modal } from '@/components/ui';

export default function ContactConfigPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  
  // Config State
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await contactService.getConfig();
        setExistingImage(data.image || '');
      } catch (err) {
        console.error('Failed to fetch contact config:', err);
        setError('Failed to load configuration.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const result = await contactService.updateConfig(formData);
      setExistingImage(result.image || '');
      setImageFile(null);
      setSuccessModal(true);
    } catch (err) {
      console.error('Update config error:', err);
      setError('Failed to update configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/inquiries" 
          className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={14} />
          Back to Inquiries
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Contact Page Configuration</h1>
        <p className="text-muted text-sm">Manage the dynamic content and images for your Contact Us page</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ImageIcon size={20} className="text-primary" /> Sidebar Banner Image
            </h3>
            <p className="text-sm text-muted">This image appears on the right side of the "Send Us a Message" form on your website.</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative group w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden bg-border/20 border-2 border-dashed border-border flex flex-col items-center justify-center transition-all hover:border-primary/50">
              {imageFile ? (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
              ) : existingImage ? (
                <img src={existingImage} alt="Existing Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted">
                  <ImageIcon size={48} strokeWidth={1.5} />
                  <span className="text-sm font-medium">No Image Uploaded</span>
                </div>
              )}
              
              <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold text-black shadow-xl scale-95 group-hover:scale-100 transition-transform">
                  <Upload size={16} />
                  {imageFile || existingImage ? 'Change Banner' : 'Upload Banner'}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10 w-full max-w-lg">
              <Info size={18} className="text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-primary uppercase">Image Requirements</h4>
                <ul className="text-xs text-muted-dark list-disc list-inside leading-relaxed">
                  <li>Recommended Aspect Ratio: 4:3 or 16:9</li>
                  <li>Max File Size: 5MB</li>
                  <li>Formats: JPG, PNG, WEBP</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              className="min-w-[160px] flex items-center justify-center gap-2"
              disabled={!imageFile}
            >
              {!isSubmitting && <Save size={18} />}
              Save Changes
            </Button>
          </div>
        </Card>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="Settings Updated"
        footer={
          <Button onClick={() => setSuccessModal(false)} className="w-full">
            Great!
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-center text-foreground font-medium">Contact page banner has been updated successfully.</p>
        </div>
      </Modal>
    </div>
  );
}
