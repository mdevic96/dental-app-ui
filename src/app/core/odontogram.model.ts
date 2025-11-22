export interface OdontogramDto {
  id: number;
  patientId: number;
  patientName: string;
  dentistId: number;
  dentistName: string;
  dentitionType: 'ADULT' | 'CHILD';
  generalNotes?: string;
  toothRecords: ToothRecordDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ToothRecordDto {
  id: number;
  toothNumber: string;
  status: ToothStatus;
  notes?: string;
  treatmentPlans: TreatmentPlanDto[];
  surfaces: ToothSurfaceDto[];
  createdByDentistId?: number;
  createdByDentistName?: string;
  createdByOfficeId?: number;
  createdByOfficeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentPlanDto {
  id: number;
  treatmentType: string;
  status: TreatmentStatus;
  serviceId?: number;
  serviceName?: string;
  plannedDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  notes?: string;
  createdByDentistId?: number;
  createdByDentistName?: string;
  createdByOfficeId?: number;
  createdByOfficeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToothSurfaceDto {
  id: number;
  surfaceType: SurfaceType;
  status: SurfaceStatus;
  notes?: string;
  createdByDentistId?: number;
  createdByDentistName?: string;
  createdByOfficeId?: number;
  createdByOfficeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionDto {
  id: number;
  odontogramId: number;
  dentistId: number;
  dentistName: string;
  officeId: number;
  officeName: string;
  actionType: string;
  metadata: { [key: string]: string };
  contributionDate: Date;
}

export type SurfaceType = 'OCCLUSAL' | 'MESIAL' | 'DISTAL' | 'BUCCAL' | 'LINGUAL';

export type SurfaceStatus =
  | 'HEALTHY'
  | 'CARIOUS'
  | 'FILLED'
  | 'FRACTURED'
  | 'WEAR'
  | 'EROSION'
  | 'STAINED'
  | 'CALCULUS';

export type ToothStatus =
  | 'HEALTHY'
  | 'CARIOUS'
  | 'FILLED'
  | 'MISSING'
  | 'CROWN'
  | 'BRIDGE'
  | 'IMPLANT'
  | 'ROOT_CANAL'
  | 'FRACTURED'
  | 'MOBILE'
  | 'IMPACTED';

export type TreatmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CreateOdontogramRequest {
  patientId: number;
  dentitionType?: 'ADULT' | 'CHILD';
  generalNotes?: string;
}

export interface UpdateToothRequest {
  toothNumber: string;
  status: ToothStatus;
  notes?: string;
}

export interface UpdateToothSurfaceRequest {
  toothNumber: string;
  surfaceType: SurfaceType;
  status: SurfaceStatus;
  notes?: string;
}

export interface CreateTreatmentPlanRequest {
  toothNumber: string;
  treatmentType: string;
  serviceId?: number;
  plannedDate?: string;
  estimatedCost?: number;
  notes?: string;
}
