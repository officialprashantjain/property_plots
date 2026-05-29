"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, Textarea, RichTextEditor, Modal } from '@/components/ui';
import propertyService from '@/services/propertyService';
import searchOptionService from '@/services/searchOptionService';
import { Image as ImageIcon, Plus, Trash2, Loader2, Save, Upload, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PropertyForm({ mode = 'add', propertyId = null }) {
  const router = useRouter();
  
  // Data State
  const [loadingInitial, setLoadingInitial] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState({ open: false, message: '' });
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchOptions, setSearchOptions] = useState({
    propertyTypes: [], locations: [], priceRanges: [], plotSizes: []
  });

  // Form State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('draft');
  const [isActive, setIsActive] = useState(true);
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Dynamic Array States
  const [faqs, setFaqs] = useState([]); // { question, answer }
  const [openFaqs, setOpenFaqs] = useState({}); // track open/closed state per index { [idx]: true/false }
  const [features, setFeatures] = useState([]); // string array

  // File Upload States
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Existing media (for edit mode)
  const [existingPrimary, setExistingPrimary] = useState('');
  const [existingGallery, setExistingGallery] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const opts = await searchOptionService.getAll();
        setSearchOptions({
          propertyTypes: opts.propertyTypes?.map(o => ({ label: o.value, value: o.value })) || [],
          locations: opts.locations?.map(o => ({ label: o.value, value: o.value })) || [],
          priceRanges: opts.priceRanges?.map(o => ({ label: o.value, value: o.value })) || [],
          plotSizes: opts.plotSizes?.map(o => ({ label: o.value, value: o.value })) || []
        });

        if (mode === 'edit' && propertyId) {
          const prop = await propertyService.getById(propertyId);
          setTitle(prop.title || '');
          setPropertyType(prop.propertyType || '');
          setLocation(prop.location || '');
          setPriceRange(prop.priceRange || '');
          setPlotSize(prop.plotSize || '');
          setPrice(prop.price || '');
          setArea(prop.area || '');
          setStatus(prop.status || 'draft');
          setIsActive(prop.isActive ?? true);
          setDescriptionHtml(prop.descriptionHtml || '');
          setVideoUrl(prop.media?.videoUrl || '');
          
          setFaqs(prop.faqs || []);
          setFeatures(prop.features || []);
          
          setExistingPrimary(prop.media?.primaryImage || '');
          setExistingGallery(prop.media?.gallery || []);
        }
      } catch (err) {
        console.error('Failed to init property form:', err);
        setError('Failed to load data. Please check connection.');
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, [mode, propertyId]);

  // Required fields validation
  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!propertyType) errors.propertyType = 'Property Type is required.';
    if (!location) errors.location = 'Location is required.';
    if (!price) errors.price = 'Actual Price is required.';
    if (!area) errors.area = 'Area is required.';
    if (!status) errors.status = 'Status is required.';
    if (mode === 'add' && !primaryImageFile) errors.primaryImage = 'Primary image is required.';
    return errors;
  };

  const isFormValid = title.trim() && propertyType && location && price && area && status && (mode === 'edit' || primaryImageFile || existingPrimary);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('propertyType', propertyType);
      formData.append('location', location);
      formData.append('price', price);
      formData.append('status', status);
      formData.append('isActive', isActive);
      
      if (priceRange) formData.append('priceRange', priceRange);
      if (plotSize) formData.append('plotSize', plotSize);
      if (area) formData.append('area', area);
      if (descriptionHtml) formData.append('descriptionHtml', descriptionHtml);
      if (videoUrl) formData.append('media.videoUrl', videoUrl);

      // JSON stringify complex arrays for safety if backend expects parsed JSON,
      // or send indexed items if backend uses nested objects. 
      // A common reliable approach is to send as JSON string.
      formData.append('faqs', JSON.stringify(faqs));
      formData.append('features', JSON.stringify(features));
      
      if (mode === 'edit') {
        if (existingPrimary) formData.append('existingPrimary', existingPrimary);
        formData.append('existingGallery', JSON.stringify(existingGallery));
      }

      // Append files
      if (primaryImageFile) {
        formData.append('primaryImage', primaryImageFile);
      }
      
      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          formData.append('gallery', file);
        });
      }

      if (mode === 'edit') {
        await propertyService.update(propertyId, formData);
        setSuccessModal({ open: true, message: 'Property updated successfully!' });
      } else {
        const result = await propertyService.create(formData);
        const newId = result?.property?.id || result?.property?._id || result?.id || result?._id;
        setSuccessModal({ 
          open: true, 
          message: 'Property created successfully!',
          redirectId: newId
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setErrorModal({ open: true, message: err.response?.data?.message || 'Action failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Media handling
  const handlePrimaryDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPrimaryImageFile(e.dataTransfer.files[0]);
    }
  };
  const removePrimary = () => {
    setPrimaryImageFile(null);
    setExistingPrimary('');
  };
  const handleGalleryDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setGalleryFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    }
  };
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    }
  };
  const removeGalleryFile = (idx) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== idx));
  };
  const removeExistingGallery = (idx) => {
    setExistingGallery(existingGallery.filter((_, i) => i !== idx));
  };

  // Feature handling
  const addFeature = () => setFeatures([...features, '']);
  const updateFeature = (idx, val) => {
    const next = [...features];
    next[idx] = val;
    setFeatures(next);
  };
  const removeFeature = (idx) => setFeatures(features.filter((_, i) => i !== idx));

  // FAQ handling
  const addFaq = () => {
    const newIdx = faqs.length;
    setFaqs([...faqs, { question: '', answer: '' }]);
    setOpenFaqs({ ...openFaqs, [newIdx]: true }); // Auto open newly added FAQ
  };
  const updateFaq = (idx, field, val) => {
    const next = [...faqs];
    next[idx][field] = val;
    setFaqs(next);
  };
  const removeFaq = (idx) => setFaqs(faqs.filter((_, i) => i !== idx));

  if (loadingInitial) {
    return (
      <Card className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-muted font-medium">Loading property details...</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main Details */}
      <Card className="flex flex-col gap-6 p-6">
        <h3 className="text-lg font-bold border-b border-border pb-3 mb-2">Basic Information</h3>

        {/* Row 1: Title (full width) */}
        <Input
          label={<>Title <span className="text-danger">*</span></>}
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (fieldErrors.title) setFieldErrors(p => ({...p, title: ''})); }}
          placeholder="e.g., Luxury Villa in West Coast"
          error={fieldErrors.title}
        />

        {/* Row 2: Property Type | Plot Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={<>Property Type <span className="text-danger">*</span></>}
            options={[{ label: '— Select Property Type —', value: '' }, ...searchOptions.propertyTypes]}
            value={propertyType}
            onChange={(e) => { setPropertyType(e.target.value); if (fieldErrors.propertyType) setFieldErrors(p => ({...p, propertyType: ''})); }}
            error={fieldErrors.propertyType}
          />
          <Select
             label={<>Plot Size Range <span className="text-danger">*</span></>}
            options={[{ label: '— Select Plot Size —', value: '' }, ...searchOptions.plotSizes]}
            value={plotSize}
            onChange={(e) => { setPlotSize(e.target.value); if (fieldErrors.plotSize) setFieldErrors(p => ({...p, plotSize: ''})); }}
            error={fieldErrors.plotSize}
          />
        </div>

        {/* Row 3: Price Range | Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Price Range"
            options={[{ label: '— Select Price Range —', value: '' }, ...searchOptions.priceRanges]}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
          <Select
            label={<>Location <span className="text-danger">*</span></>}
            options={[{ label: '— Select Location —', value: '' }, ...searchOptions.locations]}
            value={location}
            onChange={(e) => { setLocation(e.target.value); if (fieldErrors.location) setFieldErrors(p => ({...p, location: ''})); }}
            error={fieldErrors.location}
          />
        </div>

        {/* Row 4: Actual Price | Area | Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={<>Actual Price (₹) <span className="text-danger">*</span></>}
            type="number"
            value={price}
            onChange={(e) => { setPrice(e.target.value); if (fieldErrors.price) setFieldErrors(p => ({...p, price: ''})); }}
            placeholder="e.g., 5000000"
            error={fieldErrors.price}
          />
          <Input
            label={<>Area (sqft) <span className="text-danger">*</span></>}
            type="number"
            value={area}
            onChange={(e) => { setArea(e.target.value); if (fieldErrors.area) setFieldErrors(p => ({...p, area: ''})); }}
            placeholder="e.g., 3500"
            error={fieldErrors.area}
          />
          <Select
            label={<>Status <span className="text-danger">*</span></>}
            options={[
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Sold', value: 'sold' }
            ]}
            value={status}
            onChange={(e) => { setStatus(e.target.value); if (fieldErrors.status) setFieldErrors(p => ({...p, status: ''})); }}
            error={fieldErrors.status}
          />
        </div>

        {/* Is Active toggle */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-3 cursor-pointer py-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">Is Property Active (Visible)</span>
          </label>
        </div>
      </Card>

      {/* Description */}
      <Card className="flex flex-col gap-4 p-6">
        <h3 className="text-lg font-bold border-b border-border pb-3 mb-2">Description</h3>
        {/* Placeholder for Rich Text. Using standard textarea in absence of react-quill */}
        <RichTextEditor 
          value={descriptionHtml}
          onChange={(html) => setDescriptionHtml(html)}
          placeholder="Enter the full property description with formatting..."
        />
      </Card>

      {/* Media Uploads */}
      <Card className="flex flex-col gap-6 p-6">
        <h3 className="text-lg font-bold border-b border-border pb-3 mb-2">Media Details</h3>
        
        {/* Primary Image */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Primary Image <span className="text-danger">*</span>
            {mode === 'edit' && <span className="text-muted text-xs ml-2">(leave unchanged to keep current)</span>}
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handlePrimaryDrop}
            className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer w-full min-h-[200px] ${fieldErrors.primaryImage ? 'border-danger/50 bg-danger/5' : 'border-border bg-surface hover:bg-border/10'}`}
            onClick={() => document.getElementById('primary-upload').click()}
          >
            <input
              id="primary-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if(e.target.files[0]) {
                  setPrimaryImageFile(e.target.files[0]);
                  if (fieldErrors.primaryImage) setFieldErrors(p => ({...p, primaryImage: ''}));
                }
              }}
            />
            
            {(primaryImageFile || existingPrimary) ? (
              <div className="relative w-full max-w-[280px] aspect-video rounded-lg overflow-hidden border border-border group shadow-sm bg-black/5" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={primaryImageFile ? URL.createObjectURL(primaryImageFile) : existingPrimary} 
                  alt="Primary Preview" 
                  className="w-full h-full object-cover"
                />
                <button 
                  type="button"
                  onClick={removePrimary}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger backdrop-blur-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted pointer-events-none">
                <Upload size={36} className="mb-3 opacity-40 text-primary" />
                <p className="text-sm font-medium text-foreground">Click or Drag & Drop image here</p>
                <p className="text-xs mt-1">Required single primary cover image</p>
              </div>
            )}
          </div>
          {fieldErrors.primaryImage && (
            <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.primaryImage}</p>
          )}
        </div>

        {/* Gallery Images */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          <label className="text-sm font-medium text-foreground">Gallery Images (Up to 10)</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleGalleryDrop}
            className="relative flex flex-col p-6 border-2 border-dashed border-border rounded-xl bg-surface hover:bg-border/10 transition-colors w-full min-h-[200px]"
          >
            <input 
              id="gallery-upload"
              type="file" 
              accept="image/*" 
              multiple
              className="hidden"
              onChange={handleGalleryChange}
            />
            
            { (galleryFiles.length > 0 || existingGallery.length > 0) ? (
              <div className="w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-wrap gap-4">
                  {existingGallery.map((url, idx) => (
                    <div key={`exist-${idx}`} className="relative w-28 h-28 rounded-lg overflow-hidden border border-border shadow-sm group">
                      <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeExistingGallery(idx)}
                        className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger backdrop-blur-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {galleryFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative w-28 h-28 rounded-lg overflow-hidden border border-primary/20 shadow-sm group">
                      <img src={URL.createObjectURL(file)} alt={`Gallery New ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeGalleryFile(idx)}
                        className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger backdrop-blur-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(existingGallery.length + galleryFiles.length) < 10 && (
                    <div 
                      onClick={() => document.getElementById('gallery-upload').click()}
                      className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg text-muted hover:bg-border/30 hover:text-foreground cursor-pointer transition-colors bg-background"
                    >
                      <Plus size={24} className="mb-1" />
                      <span className="text-xs font-medium">Add Image</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center text-muted cursor-pointer justify-center h-full pt-4"
                onClick={() => document.getElementById('gallery-upload').click()}
              >
                <Upload size={36} className="mb-3 opacity-40 text-primary pointer-events-none" />
                <p className="text-sm font-medium text-foreground pointer-events-none">Click or Drag & Drop multiple images here</p>
                <p className="text-xs mt-1 pointer-events-none">Enhance your listing with up to 10 gallery photos</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <Input 
            label="Video URL (Optional)" 
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
          />
        </div>
      </Card>

      {/* FAQs & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Features */}
        <Card className="flex flex-col gap-4 p-6 w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
            <h3 className="text-lg font-bold">Features</h3>
            <Button size="sm" variant="outline" type="button" onClick={addFeature} iconLeft={<Plus size={14} />}>Add</Button>
          </div>
          <div className="flex flex-col gap-3">
            {features.map((feat, idx) => (
              <div key={`feat-${idx}`} className="flex items-center gap-2">
                <Input 
                  className="flex-1"
                  value={feat}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  placeholder={`Feature ${idx + 1}`}
                />
                <button type="button" onClick={() => removeFeature(idx)} className="p-2.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {features.length === 0 && <p className="text-sm text-muted text-center py-2">No features added.</p>}
          </div>
        </Card>

        {/* FAQs */}
        <Card className="flex flex-col gap-4 p-6 w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
            <h3 className="text-lg font-bold">FAQs</h3>
            <Button size="sm" variant="outline" type="button" onClick={addFaq} iconLeft={<Plus size={14} />}>Add FAQ</Button>
          </div>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <div key={`faq-${idx}`} className="flex flex-col border border-border rounded-lg bg-surface relative group overflow-hidden">
                {/* Header (always visible) */}
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-border/30 transition-colors"
                  onClick={() => setOpenFaqs({...openFaqs, [idx]: !openFaqs[idx]})}
                >
                  <div className="flex items-center gap-2 font-medium text-sm text-foreground pr-8 truncate">
                    {openFaqs[idx] ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                    {faq.question || `FAQ #${idx + 1} (Empty)`}
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeFaq(idx); }} 
                    className="p-1.5 text-danger hover:bg-danger/10 rounded-md shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                {/* Body (Collapsible) */}
                {openFaqs[idx] && (
                  <div className="p-3 pt-0 flex flex-col gap-3 border-t border-border/50 mt-2">
                    <Input 
                      label="Question"
                      value={faq.question}
                      onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                      placeholder="e.g., Is maintenance included?"
                    />
                    <Textarea 
                      label="Answer"
                      value={faq.answer}
                      onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                      rows={4}
                      className="w-full"
                      placeholder="Yes, it is included in the monthly fee."
                    />
                  </div>
                )}
              </div>
            ))}
            {faqs.length === 0 && <p className="text-sm text-muted text-center py-2">No FAQs added.</p>}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push('/properties')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting || !isFormValid}
          iconLeft={submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          title={!isFormValid ? 'Please fill in all required fields (*)' : ''}
        >
          {submitting ? 'Saving Property...' : mode === 'edit' ? 'Update Property' : 'Save Property'}
        </Button>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.open}
        onClose={() => {
          setSuccessModal({ open: false, message: '' });
          if (mode === 'edit') {
            router.push(`/properties/view/${propertyId}`);
          } else if (successModal.redirectId) {
            router.push(`/properties/view/${successModal.redirectId}`);
          } else {
            router.push('/properties');
          }
        }}
        title="Success"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-success" />
          </div>
          <p className="text-foreground font-semibold">{successModal.message}</p>
          <Button
            className="w-[40%] mt-2"
            onClick={() => {
              setSuccessModal({ open: false, message: '' });
              if (mode === 'edit') {
                router.push(`/properties/view/${propertyId}`);
              } else if (successModal.redirectId) {
                router.push(`/properties/view/${successModal.redirectId}`);
              } else {
                router.push('/properties');
              }
            }}
          >
            View Property
          </Button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: '' })}
        title="Something went wrong"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center">
            <AlertTriangle size={28} className="text-danger" />
          </div>
          <p className="text-foreground font-semibold">{errorModal.message}</p>
          <Button variant="outline" className="w-full mt-2" onClick={() => setErrorModal({ open: false, message: '' })}>
            Dismiss
          </Button>
        </div>
      </Modal>

    </form>
  );
}
