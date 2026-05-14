export type UserRole = 'guard' | 'supervisor' | 'head' | 'admin';
export type IncidentStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type IncidentSeverity = 'low' | 'medium' | 'high';
export type IncidentType = 'theft' | 'suspicious_activity' | 'vandalism' | 'lost_found' | 'facility_issue' | 'noise_complaint' | 'trespass' | 'other';
export type CampusZone = 'main_gate' | 'hostels' | 'admin_block' | 'library' | 'engineering_block' | 'science_labs' | 'sports_ground' | 'cafeteria' | 'parking' | 'other';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  badge_number: string | null;
  phone: string | null;
  zone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  reference_number: string;
  incident_type: IncidentType;
  location: string;
  campus_zone: CampusZone;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  reported_by: string | null;
  assigned_to: string | null;
  is_public_report: boolean;
  reporter_name: string | null;
  reporter_contact: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  reporter?: Profile;
  assignee?: Profile;
}

export interface IncidentNote {
  id: string;
  incident_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Evidence {
  id: string;
  incident_id: string;
  uploaded_by: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploader?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface PublicReport {
  id: string;
  reference_number: string;
  incident_type: string;
  location: string;
  campus_zone: string;
  description: string;
  reporter_name: string | null;
  reporter_contact: string | null;
  is_anonymous: boolean;
  status: string;
  incident_id: string | null;
  created_at: string;
}
