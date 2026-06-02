"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Modal, Textarea } from '@/components/ui';
import agentService from '@/services/agentService';
import { Image as ImageIcon, Save, Upload, Loader2, CheckCircle2 } from 'lucide-react';

export default function AgentForm({ mode = 'add', agentId = null }) {
  const router = useRouter();
  
  // Data State
  const [loadingInitial, setLoadingInitial] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState({ open: false, message: '', redirectId: null });
  const [fieldErrors, setFieldErrors] = useState({});

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [experience, setExperience] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    facebook: '',
    twitter: '',
    instagram: ''
  });

  // File Upload States
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');

  useEffect(() => {
    async function init() {
      if (mode === 'edit' && agentId) {
        try {
          const agent = await agentService.getById(agentId);
          setName(agent.name || '');
          setDesignation(agent.designation || '');
          setPhone(agent.phone || '');
          setEmail(agent.email || '');
          setDepartment(agent.department || '');
          setExperience(agent.experience || '');
          setOfficeAddress(agent.officeAddress || '');
          setOfficeHours(agent.officeHours || '');
          setAboutMe(agent.aboutMe || '');
          setOrder(agent.order || 0);
          setIsActive(agent.isActive ?? true);
          setSocialLinks(agent.socialLinks || {
            linkedin: '', facebook: '', twitter: '', instagram: ''
          });
          setExistingImage(agent.image || '');
        } catch (err) {
          console.error('Failed to load agent:', err);
          setError('Failed to load agent details.');
        } finally {
          setLoadingInitial(false);
        }
      }
    }
    init();
  }, [mode, agentId]);

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!designation.trim()) errors.designation = 'Designation is required.';
    if (mode === 'add' && !imageFile) errors.image = 'Profile image is required.';
    
    if (phone && !/^\d{10}$/.test(phone)) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }
    
    return errors;
  };

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
      formData.append('name', name);
      formData.append('designation', designation);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('department', department);
      formData.append('experience', experience);
      formData.append('officeAddress', officeAddress);
      formData.append('officeHours', officeHours);
      formData.append('aboutMe', aboutMe);
      formData.append('order', order);
      formData.append('isActive', isActive);
      formData.append('socialLinks', JSON.stringify(socialLinks));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (mode === 'edit') {
        const result = await agentService.update(agentId, formData);
        const id = result?.id || result?._id || agentId;
        setSuccessModal({ 
          open: true, 
          message: 'Agent updated successfully!',
          redirectId: id
        });
      } else {
        const result = await agentService.create(formData);
        const id = result?.id || result?._id;
        setSuccessModal({ 
          open: true, 
          message: 'Agent created successfully!',
          redirectId: id
        });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  if (loadingInitial) {
    return (
      <Card className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-muted font-medium">Loading agent details...</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto">
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Upload */}
        <div className="lg:col-span-1">
          <Card className="p-6 flex flex-col items-center gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-dark w-full text-center border-b pb-2 mb-2">
              Profile Picture
            </h3>
            
            <div className="relative group w-full aspect-square max-w-[200px] rounded-xl overflow-hidden bg-border/30 border-2 border-dashed border-border flex flex-col items-center justify-center transition-all hover:border-primary/50">
              {imageFile ? (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
              ) : existingImage ? (
                <img src={existingImage} alt="Existing" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted">
                  <ImageIcon size={40} strokeWidth={1.5} />
                  <span className="text-xs font-medium">No Image</span>
                </div>
              )}
              
              <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-black shadow-lg">
                  <Upload size={14} />
                  {imageFile || existingImage ? 'Change Photo' : 'Upload Photo'}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            
            {fieldErrors.image && <p className="text-danger text-xs font-medium mt-1">{fieldErrors.image}</p>}
            
            <p className="text-[10px] text-muted text-center mt-2 leading-relaxed">
              Recommended size: 500x500px. Max size: 5MB.<br/>Allowed types: JPG, PNG, WEBP.
            </p>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-dark border-b pb-2 mb-2">
              Agent Details
            </h3>

            <Input
              label={<>Full Name <span className="text-danger">*</span></>}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Philippe Starck"
              error={fieldErrors.name}
            />

            <Input
              label={<>Designation <span className="text-danger">*</span></>}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Property Expert"
              error={fieldErrors.designation}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                }}
                placeholder="e.g. 9876543210"
                error={fieldErrors.phone}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. philippe@starck.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Luxury Residential"
              />
              <Input
                label="Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 10+ Years"
              />
            </div>

            <div className="">
              <Input
                label="Office Hours"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                placeholder="e.g. Mon-Fri, 9AM-6PM"
              />
              {/* <Input
                label="Display Order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                helper="Lower numbers appear first"
              /> */}
            </div>

            <Input
              label="Office Address"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="e.g. 123 Real Estate Ave, Business Bay"
            />

            <Textarea
              label="About Agent"
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about the agent's background and expertise..."
              rows={4}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Status</label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    checked={isActive} 
                    onChange={() => setIsActive(true)}
                    className="w-4 h-4 text-primary focus:ring-primary border-border"
                  />
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-dark'}`}>Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    checked={!isActive} 
                    onChange={() => setIsActive(false)}
                    className="w-4 h-4 text-primary focus:ring-primary border-border"
                  />
                  <span className={`text-sm font-medium ${!isActive ? 'text-danger' : 'text-muted-dark'}`}>Inactive</span>
                </label>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-dark border-b pb-2 mb-2">
              Social Profiles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="LinkedIn Profile"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                placeholder="https://linkedin.com/in/..."
              />
              <Input
                label="Facebook Profile"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Twitter (X) Profile"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                placeholder="https://x.com/..."
              />
              <Input
                label="Instagram Profile"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                placeholder="https://instagram.com/..."
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} className="min-w-[140px] flex items-center justify-center gap-2">
              {!submitting && <Save size={18} />}
              {mode === 'edit' ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.open}
        onClose={() => successModal.redirectId && router.push(`/agents/view/${successModal.redirectId}`)}
        title="Success"
        footer={
          <div className="flex flex-col gap-2 w-full">
            <Button 
              onClick={() => successModal.redirectId && router.push(`/agents/view/${successModal.redirectId}`)} 
              className="w-full flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              View Agent Profile
            </Button>
         
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-center text-foreground font-medium">{successModal.message}</p>
        </div>
      </Modal>
    </form>
  );
}
