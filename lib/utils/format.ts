import { format, differenceInHours } from 'date-fns';
import { IncidentStatus, IncidentType, CampusZone } from '@/lib/types';

export const formatStatus = (status: IncidentStatus): string => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatType = (type: IncidentType): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatZone = (zone: CampusZone): string => {
  return zone.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return 'N/A';
  return format(new Date(iso), 'dd MMM yyyy, HH:mm');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const resolutionHours = (created: string, resolved: string | null): string => {
  if (!resolved) return 'N/A';
  const diff = differenceInHours(new Date(resolved), new Date(created));
  return `${diff} hrs`;
};
