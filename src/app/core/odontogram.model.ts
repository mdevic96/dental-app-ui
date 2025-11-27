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

export interface PatientProfileDto {
  id: number;
  userId: number;

  // From User entity
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  // From PatientProfile entity
  address?: string;
  occupation?: string;
  birthDate: string; // ISO date string
  generalNotes?: string;
  warningSign: boolean;
  warningDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientProfileRequest {
  birthDate: string;
  address?: string;
  occupation?: string;
  generalNotes?: string;
  warningSign?: boolean;
  warningDescription?: string;
}

export interface UpdatePatientProfileRequest {
  // User fields
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;

  // PatientProfile fields
  address?: string;
  occupation?: string;
  birthDate: string;
  generalNotes?: string;
  warningSign?: boolean;
  warningDescription?: string;
}

export type SurfaceType = 'OCCLUSAL' | 'MESIAL' | 'DISTAL' | 'BUCCAL' | 'LINGUAL' | 'LABIAL' | 'PALATAL' | 'INCISAL';

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
