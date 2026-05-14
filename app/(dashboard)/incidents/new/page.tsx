'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { EvidenceUpload } from '@/components/incidents/EvidenceUpload';
import { generateIncidentReference } from '@/lib/utils/reference';
import { IncidentType, IncidentSeverity, CampusZone } from '@/lib/types';
import { Shield } from 'lucide-react';

const incidentSchema = z.object({
  incident_type: z.string().min(1, 'Type is required'),
  campus_zone: z.string().min(1, 'Zone is required'),
  location: z.string().min(1, 'Specific location is required'),
  severity: z.string().min(1, 'Severity is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

export default function NewIncidentPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      severity: 'medium',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: IncidentFormData) => {
    setLoading(true);
    try {
      const ref = await generateIncidentReference();
      
      const { data: incident, error: incError } = await supabase
        .from('incidents')
        .insert({
          reference_number: ref,
          incident_type: data.incident_type as IncidentType,
          campus_zone: data.campus_zone as CampusZone,
          location: data.location,
          severity: data.severity as IncidentSeverity,
          description: data.description,
          reported_by: profile?.id,
          status: 'pending',
        })
        .select()
        .single();

      if (incError) throw incError;

      // Upload Evidence
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `evidence/${incident.id}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file);

          if (!uploadError) {
            await supabase.from('evidence').insert({
              incident_id: incident.id,
              uploaded_by: profile?.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
            });
          }
        }
      }

      // Audit Log
      await supabase.from('audit_logs').insert({
        user_id: profile?.id,
        action: 'CREATE_INCIDENT',
        target_type: 'incident',
        target_id: incident.id,
        details: { reference: ref },
      });

      toast('success', `Incident logged successfully: ${ref}`);
      router.push(`/incidents/${incident.id}`);
    } catch (error: any) {
      toast('error', error.message || 'Failed to log incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader 
        title="Log New Incident" 
        description="Formal entry for the security incident management system." 
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-8 space-y-6">
          <h2 className="text-lg font-display font-medium text-primary pb-4 border-b border-border">Incident Details</h2>
          
          <Select 
            label="Incident Type" 
            {...register('incident_type')}
            error={errors.incident_type?.message}
            options={[
              { label: 'Select Type', value: '' },
              { label: 'Theft', value: 'theft' },
              { label: 'Suspicious Activity', value: 'suspicious_activity' },
              { label: 'Vandalism', value: 'vandalism' },
              { label: 'Lost & Found', value: 'lost_found' },
              { label: 'Facility Issue', value: 'facility_issue' },
              { label: 'Noise Complaint', value: 'noise_complaint' },
              { label: 'Trespass', value: 'trespass' },
              { label: 'Other', value: 'other' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Campus Zone" 
              {...register('campus_zone')}
              error={errors.campus_zone?.message}
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
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted font-medium">Severity</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((sev) => (
                  <label key={sev} className="flex-1">
                    <input 
                      type="radio" 
                      value={sev} 
                      {...register('severity')} 
                      className="peer hidden"
                    />
                    <div className="text-center py-2 text-xs uppercase tracking-wider font-mono border border-border cursor-pointer peer-checked:bg-primary peer-checked:text-background transition-colors">
                      {sev}
                    </div>
                  </label>
                ))}
              </div>
              {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
            </div>
          </div>

          <Input 
            label="Specific Location" 
            placeholder="e.g. Science Block B, Room 402"
            {...register('location')}
            error={errors.location?.message}
          />

          <Textarea 
            label="Detailed Description" 
            placeholder="Provide a comprehensive account of the incident..."
            {...register('description')}
            error={errors.description?.message}
          />
        </div>

        <div className="space-y-8">
          <EvidenceUpload 
            files={files} 
            onFileChange={handleFileChange} 
            onRemove={removeFile} 
          />

          <div className="card p-8 bg-accent/5 border-accent/20">
            <p className="text-xs text-primary/80 mb-6 leading-relaxed">
              By submitting this report, you confirm that all information provided is accurate to the best of your knowledge. This report will be officially recorded in the JKUAT Security Database.
            </p>
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={loading}>
                Finalize Report
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
