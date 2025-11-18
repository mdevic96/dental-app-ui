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
  createdAt: string;
  updatedAt: string;
}

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

export interface CreateTreatmentPlanRequest {
  toothNumber: string;
  treatmentType: string;
  serviceId?: number;
  plannedDate?: string;
  estimatedCost?: number;
  notes?: string;
}
