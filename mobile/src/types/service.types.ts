// src/types/service.types.ts

export type ServiceStatus = 'pending' | 'inprogress' | 'done' | 'urgent';
export type ServiceTag    = 'Botany' | 'Entretien' | 'Taille' | 'Installation' | 'Mensuel' | 'Ponctuel' | 'Premium';

export interface ChecklistItem {
  id:    string;
  label: string;
  done:  boolean;
}

export interface Service {
  id:             string;
  title:          string;
  address:        string;
  client:         string;
  date:           string;
  estimatedHours: number;
  status:         ServiceStatus;
  tag:            ServiceTag;
  image:          string;
  materials:      string[];
  checklist:      ChecklistItem[];
  scope:          string;
  note:           string;
}