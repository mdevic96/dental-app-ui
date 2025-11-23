import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OdontogramService } from './odontogram.service';
import {
  OdontogramDto,
  ToothRecordDto,
  ToothStatus,
  CreateTreatmentPlanRequest,
  TreatmentPlanDto,
  ToothSurfaceDto, SurfaceStatus, SurfaceType, UpdateToothSurfaceRequest, ContributionDto, PatientProfileDto,
  UpdatePatientProfileRequest
} from '../../../core/odontogram.model';
import { UserDto } from '../../../core/user.model';
import { DentistServiceDto } from '../../../core/dentist-service.model';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import {PatientProfileService} from './patient-profile.service';

@Component({
  selector: 'app-odontogram',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './odontogram.component.html',
  styleUrls: ['./odontogram.component.css']
})
export class OdontogramComponent implements OnInit {
  // Patient selection
  patients: UserDto[] = [];
  filteredPatients: UserDto[] = [];
  selectedPatientId: number | null = null;
  selectedPatientName: string = '';
  patientSearchTerm: string = '';
  showPatientDropdown: boolean = false;

  // Odontogram data
  currentOdontogram: OdontogramDto | null = null;
  selectedTooth: ToothRecordDto | null = null;

  // Tooth chart layout (FDI notation)
  upperTeeth: string[] = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
  lowerTeeth: string[] = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

  // Tooth statuses for dropdown
  toothStatuses: ToothStatus[] = ['HEALTHY', 'CARIOUS', 'FILLED', 'MISSING', 'CROWN', 'BRIDGE', 'IMPLANT', 'ROOT_CANAL', 'FRACTURED', 'MOBILE', 'IMPACTED'];

  // Treatment planning
  showTreatmentDialog = false;
  treatmentForm: CreateTreatmentPlanRequest = {
    toothNumber: '',
    treatmentType: '',
    notes: ''
  };

  // Tooth surface management
  selectedSurface: ToothSurfaceDto | null = null;
  surfaceStatuses: SurfaceStatus[] = ['HEALTHY', 'CARIOUS', 'FILLED', 'FRACTURED', 'WEAR', 'EROSION', 'STAINED', 'CALCULUS'];
  showSurfaceDialog = false;

  // Contributions
  contributions: ContributionDto[] = [];
  showContributionHistory = false;

  availableServices: DentistServiceDto[] = [];

  // Patient profile
  showPatientProfileDialog = false;
  patientProfile: PatientProfileDto | null = null;

  // Loading state
  isLoading: boolean = false;

  constructor(
    private odontogramService: OdontogramService,
    private http: HttpClient,
    private translate: TranslateService,
    private patientProfileService: PatientProfileService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadServices();
  }

  loadPatients(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    // Get dentist's dental office first
    this.http.get<any>(`${environment.apiBase}/dentists/me/office`, { headers })
      .subscribe(office => {
        // Then get patients for this office
        this.http.get<UserDto[]>(`${environment.apiBase}/patients/dental-office/${office.id}`, { headers })
          .subscribe(patients => {
            this.patients = patients;
            this.filteredPatients = patients;
          });
      });
  }

  loadServices(): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any>(`${environment.apiBase}/dentists/me/office`, { headers })
      .subscribe(office => {
        this.http.get<DentistServiceDto[]>(`${environment.apiBase}/services/dental-office/${office.id}`, { headers })
          .subscribe(services => {
            this.availableServices = services;
          });
      });
  }

  onPatientSearchInput(): void {
    this.showPatientDropdown = true;
    const term = this.patientSearchTerm.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  }

  selectPatient(patient: UserDto): void {
    this.selectedPatientId = patient.id;
    this.selectedPatientName = `${patient.firstName} ${patient.lastName}`;
    this.patientSearchTerm = this.selectedPatientName;
    this.showPatientDropdown = false;
    this.filteredPatients = [];
    this.selectedTooth = null;
    this.patientProfile = null;

    this.loadPatientOdontogram();
  }

  loadPatientOdontogram(): void {
    if (!this.selectedPatientId) return;

    this.isLoading = true;
    this.odontogramService.getLatestOdontogram(this.selectedPatientId).subscribe({
      next: (odontogram) => {
        this.currentOdontogram = odontogram;
        this.loadContributionHistory(odontogram.id);
        this.loadPatientProfile();

        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.createNewOdontogram();
        } else {
          this.isLoading = false;
          console.error('Error loading odontogram');
        }
      }
    });
  }

  loadContributionHistory(odontogramId: number): void {
    this.odontogramService.getContributionHistory(odontogramId).subscribe({
      next: (contributions) => {
        this.contributions = contributions;
      },
      error: (err) => {
        console.error('Error loading contribution history', err);
      }
    });
  }

  toggleContributionHistory(): void {
    this.showContributionHistory = !this.showContributionHistory;
  }

  getOfficeBadgeColor(officeId: number): string {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[officeId % colors.length];
  }

  createNewOdontogram(): void {
    if (!this.selectedPatientId) return;

    this.odontogramService.createOdontogram({
      patientId: this.selectedPatientId,
      dentitionType: 'ADULT'
    }).subscribe(odontogram => {
      this.currentOdontogram = odontogram;
      this.isLoading = false;
      console.log('New odontogram created successfully!');
    });
  }

  getToothRecord(toothNumber: string): ToothRecordDto | undefined {
    return this.currentOdontogram?.toothRecords.find(t => t.toothNumber === toothNumber);
  }

  selectTooth(toothNumber: string): void {
    const tooth = this.getToothRecord(toothNumber);
    if (tooth) {
      this.selectedTooth = { ...tooth }; // Clone to avoid direct mutation
    }
  }

  updateToothStatus(): void {
    if (!this.selectedTooth || !this.currentOdontogram) return;

    this.odontogramService.updateTooth(this.currentOdontogram.id, {
      toothNumber: this.selectedTooth.toothNumber,
      status: this.selectedTooth.status,
      notes: this.selectedTooth.notes
    }).subscribe({
      next: (updated) => {
        // Update the tooth in current odontogram
        const index = this.currentOdontogram!.toothRecords.findIndex(
          t => t.toothNumber === updated.toothNumber
        );
        if (index !== -1) {
          this.currentOdontogram!.toothRecords[index] = updated;
        }

        this.selectedTooth = updated;

        this.loadContributionHistory(this.currentOdontogram!.id);
        console.log('Tooth updated successfully!');
      },
      error: () => console.log('Error updating tooth')
    });
  }

  openPatientProfile(): void {
    if (!this.selectedPatientId) return;

    this.showPatientProfileDialog = true;
    this.loadPatientProfile();
  }

  closePatientProfile(): void {
    this.showPatientProfileDialog = false;
  }

  loadPatientProfile(): void {
    if (!this.selectedPatientId) return;

    this.patientProfileService.getProfile(this.selectedPatientId).subscribe({
      next: (profile) => {
        this.patientProfile = profile;
        console.log('Profile loaded:', profile);
      },
      error: (err) => {
        console.error('Error loading patient profile:', err);
      }
    });
  }

  savePatientProfile(): void {
    if (!this.patientProfile || !this.selectedPatientId) return;

    // Validate required fields
    if (!this.patientProfile.firstName?.trim() ||
      !this.patientProfile.lastName?.trim() ||
      !this.patientProfile.phoneNumber?.trim() ||
      !this.patientProfile.birthDate) {
      console.error('Please fill in all required fields');
      return;
    }

    // Validate warning description if warning sign is checked
    if (this.patientProfile.warningSign && !this.patientProfile.warningDescription?.trim()) {
      console.error('Please provide a warning description');
      return;
    }

    const updateRequest: UpdatePatientProfileRequest = {
      firstName: this.patientProfile.firstName,
      lastName: this.patientProfile.lastName,
      email: this.patientProfile.email,
      phoneNumber: this.patientProfile.phoneNumber,
      address: this.patientProfile.address,
      occupation: this.patientProfile.occupation,
      birthDate: this.patientProfile.birthDate,
      generalNotes: this.patientProfile.generalNotes,
      warningSign: this.patientProfile.warningSign,
      warningDescription: this.patientProfile.warningDescription
    };

    this.patientProfileService.updateProfile(this.selectedPatientId, updateRequest).subscribe({
      next: (updated) => {
        this.patientProfile = updated;
        console.log('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Error updating profile:', err);
      }
    });
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  openTreatmentDialog(): void {
    if (!this.selectedTooth) return;

    this.treatmentForm = {
      toothNumber: this.selectedTooth.toothNumber,
      treatmentType: '',
      notes: ''
    };
    this.showTreatmentDialog = true;
  }

  closeTreatmentDialog(): void {
    this.showTreatmentDialog = false;
  }

  addTreatment(): void {
    if (!this.currentOdontogram || !this.treatmentForm.treatmentType) {
      console.error('Please fill in treatment type');
      return;
    }

    const currentToothNumber = this.treatmentForm.toothNumber;

    this.odontogramService.addTreatmentPlan(this.currentOdontogram.id, this.treatmentForm)
      .subscribe({
        next: () => {
          this.showTreatmentDialog = false;

          // Reload odontogram to get updated tooth records with treatments
          this.loadPatientOdontogram();

          setTimeout(() => {
            this.selectTooth(currentToothNumber);
          }, 100);

          console.log('Treatment plan added successfully!');
        },
        error: () => console.error('Error adding treatment')
      });
  }

  updateTreatmentStatus(treatment: TreatmentPlanDto, newStatus: string): void {
    const completedDate = newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined;
    const currentToothNumber = this.selectedTooth?.toothNumber;

    this.odontogramService.updateTreatmentStatus(treatment.id, newStatus, completedDate)
      .subscribe({
        next: () => {
          this.loadPatientOdontogram();

          if (currentToothNumber) {
            setTimeout(() => {
              this.selectTooth(currentToothNumber);
            }, 100);
          }

          console.log('Treatment status updated!');
        },
        error: () => console.error('Error updating treatment status')
      });
  }

  getToothName(toothNumber: string): string {
    const quadrant = toothNumber[0];
    const position = toothNumber[1];

    const quadrantKey = {
      '1': 'UPPER_RIGHT',
      '2': 'UPPER_LEFT',
      '3': 'LOWER_LEFT',
      '4': 'LOWER_RIGHT'
    }[quadrant];

    const positionKey = {
      '1': 'CENTRAL_INCISOR',
      '2': 'LATERAL_INCISOR',
      '3': 'CANINE',
      '4': 'FIRST_PREMOLAR',
      '5': 'SECOND_PREMOLAR',
      '6': 'FIRST_MOLAR',
      '7': 'SECOND_MOLAR',
      '8': 'THIRD_MOLAR'
    }[position];

    const quadrantName = this.translate.instant(`ODONTOGRAM.TOOTH_NAMES.${quadrantKey}`);
    const positionName = this.translate.instant(`ODONTOGRAM.TOOTH_NAMES.${positionKey}`);

    return `${quadrantName} ${positionName}`;
  }

  getStatusLabel(status: ToothStatus): string {
    return this.translate.instant(`ODONTOGRAM.TOOTH_STATUS.${status}`);
  }

  getSurfaceStatus(toothNumber: string, surfaceType: SurfaceType): SurfaceStatus {
    const tooth = this.getToothRecord(toothNumber);
    if (!tooth || !tooth.surfaces) return 'HEALTHY';

    const surface = tooth.surfaces.find(s => s.surfaceType === surfaceType);
    return surface ? surface.status : 'HEALTHY';
  }

  getSurfaceColor(toothNumber: string, surfaceType: SurfaceType): string {
    const status = this.getSurfaceStatus(toothNumber, surfaceType);

    const colorMap: Record<SurfaceStatus, string> = {
      'HEALTHY': 'rgba(0, 0, 0, 0.6)',
      'CARIOUS': 'rgba(255, 68, 68, 0.85)',
      'FILLED': 'rgba(65, 105, 225, 0.85)',
      'FRACTURED': 'rgba(255, 140, 0, 0.85)',
      'WEAR': 'rgba(255, 215, 0, 0.85)',
      'EROSION': 'rgba(255, 105, 180, 0.85)',
      'STAINED': 'rgba(139, 69, 19, 0.85)',
      'CALCULUS': 'rgba(128, 128, 0, 0.85)'
    };

    return colorMap[status] || 'rgba(0, 0, 0, 0.6)';
  }

  onSurfaceClick(event: Event, toothNumber: string, surfaceType: SurfaceType): void {
    event.stopPropagation(); // Prevent tooth selection

    const tooth = this.getToothRecord(toothNumber);
    if (!tooth) return;

    // Select the tooth first
    this.selectedTooth = { ...tooth };

    // Find the surface
    const surface = tooth.surfaces?.find(s => s.surfaceType === surfaceType);
    if (surface) {
      this.selectedSurface = { ...surface };
      this.showSurfaceDialog = true;
    }
  }

  closeSurfaceDialog(): void {
    this.showSurfaceDialog = false;
    this.selectedSurface = null;
  }

  updateSurfaceStatus(): void {
    if (!this.selectedSurface || !this.currentOdontogram || !this.selectedTooth) return;

    const request: UpdateToothSurfaceRequest = {
      toothNumber: this.selectedTooth.toothNumber,
      surfaceType: this.selectedSurface.surfaceType,
      status: this.selectedSurface.status,
      notes: this.selectedSurface.notes
    };

    this.odontogramService.updateToothSurface(this.currentOdontogram.id, request)
      .subscribe({
        next: (updated) => {
          // Reload odontogram to get updated data
          this.loadPatientOdontogram();
          this.showSurfaceDialog = false;
          console.log('Surface updated successfully!');
        },
        error: () => console.error('Error updating surface')
      });
  }

  getSurfaceLabel(surfaceType: SurfaceType): string {
    return this.translate.instant(`ODONTOGRAM.SURFACE_TYPES.${surfaceType}`);
  }

  getSurfaceStatusLabel(status: SurfaceStatus): string {
    return this.translate.instant(`ODONTOGRAM.SURFACE_STATUS.${status}`);
  }

  getToothImage(toothNumber: string): string {
    const quadrant = toothNumber[0];
    const position = parseInt(toothNumber[1]);
    const isUpper = quadrant === '1' || quadrant === '2';

    let toothType: string;

    if (position === 1 || position === 2) {
      toothType = 'incisor';
    } else if (position === 3) {
      toothType = 'canine';
    } else if (position === 4 || position === 5) {
      toothType = 'premolar';
    } else {
      toothType = 'molar';
    }

    const jawType = isUpper ? 'upper' : 'lower';
    return `/teeth/${jawType}-${toothType}.png`;
  }

  getToothFilter(toothNumber: string): string {
    const tooth = this.getToothRecord(toothNumber);
    if (!tooth) return 'none';

    const filterMap: Record<ToothStatus, string> = {
      'HEALTHY': 'none',
      'CARIOUS': 'brightness(0.7) sepia(1) hue-rotate(-20deg) saturate(4)',
      'FILLED': 'brightness(0.85) sepia(0.4) hue-rotate(180deg) saturate(1.5)',
      'MISSING': 'grayscale(1) opacity(0.3) blur(1px)',
      'CROWN': 'brightness(1.15) sepia(0.6) hue-rotate(30deg) saturate(1.3)',
      'BRIDGE': 'brightness(0.9) sepia(0.5) hue-rotate(250deg) saturate(1.2)',
      'IMPLANT': 'grayscale(0.6) brightness(0.85) contrast(1.1)',
      'ROOT_CANAL': 'brightness(1.1) sepia(0.3) hue-rotate(80deg)',
      'FRACTURED': 'brightness(0.8) contrast(1.3) saturate(0.8)',
      'MOBILE': 'brightness(1.05) sepia(0.4) hue-rotate(50deg)',
      'IMPACTED': 'brightness(0.85) sepia(0.5) hue-rotate(300deg) saturate(1.2)'
    };

    return filterMap[tooth.status] || 'none';
  }

  getTranslatedDescription(contribution: ContributionDto): string {
    const actionType = contribution.actionType;
    const meta = contribution.metadata;

    switch (actionType) {
      case 'CREATED':
        return this.translate.instant('ODONTOGRAM.CONTRIBUTION_DESCRIPTIONS.CREATED');

      case 'UPDATED_NOTES':
        return this.translate.instant('ODONTOGRAM.CONTRIBUTION_DESCRIPTIONS.UPDATED_NOTES');

      case 'UPDATED_SURFACE':
        return this.translate.instant('ODONTOGRAM.CONTRIBUTION_DESCRIPTIONS.UPDATED_SURFACE', {
          surfaceType: this.translate.instant(`ODONTOGRAM.SURFACE_TYPES.${meta['surfaceType']}`),
          toothNumber: meta['toothNumber'],
          status: this.translate.instant(`ODONTOGRAM.SURFACE_STATUS.${meta['status']}`)
        });

      case 'UPDATED_TOOTH':
        return this.translate.instant('ODONTOGRAM.CONTRIBUTION_DESCRIPTIONS.UPDATED_TOOTH', {
          toothNumber: meta['toothNumber'],
          status: this.translate.instant(`ODONTOGRAM.TOOTH_STATUS.${meta['status']}`)
        });

      case 'ADDED_TREATMENT':
        return this.translate.instant('ODONTOGRAM.CONTRIBUTION_DESCRIPTIONS.ADDED_TREATMENT', {
          treatmentType: meta['treatmentType'],
          toothNumber: meta['toothNumber']
        });

      case 'UPDATED_TREATMENT':
        return this.translate.instant('ODONTOGRAM.CONTRIBUTION_DESCRIPTIONS.UPDATED_TREATMENT', {
          status: meta['status']
        });

      default:
        return actionType;
    }
  }
}
