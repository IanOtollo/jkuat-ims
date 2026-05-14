'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { generatePublicReference } from '@/lib/utils/reference';
import { Shield, Send, CheckCircle, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';

export default function PublicPortalPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    type: '',
    zone: '',
    location: '',
    description: '',
    name: '',
    contact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ref = await generatePublicReference();
      
      const { error } = await supabase
        .from('public_reports')
        .insert({
          reference_number: ref,
          incident_type: formData.type,
          campus_zone: formData.zone,
          location: formData.location,
          description: formData.description,
          is_anonymous: isAnonymous,
          reporter_name: isAnonymous ? null : formData.name,
          reporter_contact: isAnonymous ? null : formData.contact,
        });

      if (error) throw error;
      
      setRefNumber(ref);
      setIsSubmitted(true);
      toast('success', 'Report submitted successfully');
    } catch (error: any) {
      toast('error', error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full card p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-status-resolved/10 text-status-resolved rounded-full flex items-center justify-center mx-auto mb-4 border border-status-resolved/30">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-display font-medium text-primary">Report Submitted</h1>
          <p className="text-muted text-sm leading-relaxed">
            Your report has been successfully recorded in the security database. Please save your reference number for future tracking.
          </p>
          <div className="bg-surface-raised p-6 border border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-accent tracking-wider">{refNumber}</p>
          </div>
          <div className="pt-6 space-y-3">
            <Link href="/portal/track">
              <Button className="w-full">Track My Report</Button>
            </Link>
            <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-body text-primary pb-20">
      <EmergencyBanner />
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.jpeg" alt="JKUAT Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-lg font-display font-bold leading-tight uppercase tracking-tight">JKUAT Security</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Public Reporting Portal</p>
            </div>
          </div>
          <Link href="/portal/track">
            <Button variant="secondary" size="sm">
              <Search size={14} className="mr-2" /> Track Report
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pt-12">
        <div className="mb-12">
          <h2 className="text-4xl font-display font-medium mb-4">Incident Reporting</h2>
          <p className="text-muted leading-relaxed">
            This portal is for reporting security incidents, suspicious activities, or emergencies within the JKUAT campus. Your report will be triaged by the Security Department.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Classification */}
          <div className="card p-8 space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-accent font-bold pb-4 border-b border-border flex items-center gap-2">
              <Shield size={16} /> Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Nature of Incident" 
                required
                value={formData.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, type: e.target.value})}
                options={[
                  { label: 'Select Type', value: '' },
                  { label: 'Theft', value: 'theft' },
                  { label: 'Suspicious Activity', value: 'suspicious_activity' },
                  { label: 'Vandalism', value: 'vandalism' },
                  { label: 'Medical Emergency', value: 'medical' },
                  { label: 'Harassment', value: 'harassment' },
                  { label: 'Fire Outbreak', value: 'fire' },
                  { label: 'Other', value: 'other' },
                ]}
              />
              <Select 
                label="Campus Zone" 
                required
                value={formData.zone}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, zone: e.target.value})}
                options={[
                  { label: 'Select Zone', value: '' },
                  { label: 'Main Gate', value: 'main_gate' },
                  { label: 'Hostels', value: 'hostels' },
                  { label: 'Admin Block', value: 'admin_block' },
                  { label: 'Library', value: 'library' },
                  { label: 'Engineering Block', value: 'engineering_block' },
                  { label: 'Science Labs', value: 'science_labs' },
                  { label: 'Sports Ground', value: 'sports_ground' },
                  { label: 'Cafeteria', value: 'cafeteria' },
                  { label: 'Parking', value: 'parking' },
                  { label: 'Other', value: 'other' },
                ]}
              />
            </div>
            <Input 
              label="Precise Location" 
              placeholder="e.g. Near Hall 6, Ground Floor" 
              required
              value={formData.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          {/* Description */}
          <div className="card p-8 space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-accent font-bold pb-4 border-b border-border">Details</h3>
            <Textarea 
              label="Account of Incident" 
              placeholder="Please provide as much detail as possible..." 
              required
              rows={6}
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Identity */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-sm uppercase tracking-widest text-accent font-bold">Reporter Identity</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">Remain Anonymous</span>
                <button 
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-10 h-5 relative rounded-full transition-colors ${isAnonymous ? 'bg-accent' : 'bg-border'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${isAnonymous ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <Input 
                  label="Full Name" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                />
                <Input 
                  label="Phone or Email" 
                  placeholder="07XX XXX XXX"
                  value={formData.contact}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
            )}
            <p className="text-[10px] text-muted leading-relaxed">
              * Choosing to remain anonymous may limit our ability to follow up with you for additional information. Your identity is protected under university security protocols.
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-14 text-base" isLoading={loading}>
              <Send size={18} className="mr-2" /> Submit Formal Report
            </Button>
          </div>
        </form>
      </main>

      <footer className="max-w-3xl mx-auto px-6 pt-20 text-center text-muted">
        <p className="text-xs uppercase tracking-[0.2em] mb-4">JKUAT Security Department Operations</p>
        <div className="flex justify-center gap-8 border-t border-border pt-8">
          <Link href="/login" className="text-[10px] hover:text-accent uppercase tracking-widest transition-colors font-bold">Personnel Login</Link>
          <Link href="/portal/track" className="text-[10px] hover:text-accent uppercase tracking-widest transition-colors font-bold">Track Submission</Link>
          <span className="text-[10px] uppercase tracking-widest font-bold">Emergency: 0793824968</span>
        </div>
      </footer>
    </div>
  );
}
