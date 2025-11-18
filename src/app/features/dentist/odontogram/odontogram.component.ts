import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OdontogramService } from './odontogram.service';
import { OdontogramDto, ToothRecordDto, ToothStatus, CreateTreatmentPlanRequest, TreatmentPlanDto } from '../../../core/odontogram.model';
import { UserDto } from '../../../core/user.model';
import { DentistServiceDto } from '../../../core/dentist-service.model';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

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
  availableServices: DentistServiceDto[] = [];

  // General notes
  generalNotes: string = '';

  // Loading state
  isLoading: boolean = false;

  constructor(
    private odontogramService: OdontogramService,
    private http: HttpClient
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
    this.loadPatientOdontogram();
  }

  loadPatientOdontogram(): void {
    if (!this.selectedPatientId) return;

    this.isLoading = true;
    this.odontogramService.getLatestOdontogram(this.selectedPatientId).subscribe({
      next: (odontogram) => {
        this.currentOdontogram = odontogram;
        this.generalNotes = odontogram.generalNotes || '';
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          // No odontogram exists, create new one
          this.createNewOdontogram();
        } else {
          this.isLoading = false;
          alert('Error loading odontogram');
        }
      }
    });
  }

  createNewOdontogram(): void {
    if (!this.selectedPatientId) return;

    this.odontogramService.createOdontogram({
      patientId: this.selectedPatientId,
      dentitionType: 'ADULT'
    }).subscribe(odontogram => {
      this.currentOdontogram = odontogram;
      this.generalNotes = '';
      this.isLoading = false;
      alert('New odontogram created successfully!');
    });
  }

  getToothRecord(toothNumber: string): ToothRecordDto | undefined {
    return this.currentOdontogram?.toothRecords.find(t => t.toothNumber === toothNumber);
  }

  getToothColor(toothNumber: string): string {
    const tooth = this.getToothRecord(toothNumber);
    if (!tooth) return '#ffffff';

    const colorMap: Record<ToothStatus, string> = {
      'HEALTHY': '#ffffff',
      'CARIOUS': '#ff4444',
      'FILLED': '#4169e1',
      'MISSING': '#cccccc',
      'CROWN': '#ffd700',
      'BRIDGE': '#9370db',
      'IMPLANT': '#808080',
      'ROOT_CANAL': '#90ee90',
      'FRACTURED': '#ff8c00',
      'MOBILE': '#ffff00',
      'IMPACTED': '#ff69b4'
    };

    return colorMap[tooth.status] || '#ffffff';
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
        alert('Tooth updated successfully!');
      },
      error: () => alert('Error updating tooth')
    });
  }

  saveGeneralNotes(): void {
    if (!this.currentOdontogram) return;

    this.odontogramService.updateGeneralNotes(this.currentOdontogram.id, this.generalNotes)
      .subscribe({
        next: (updated) => {
          this.currentOdontogram = updated;
          alert('Notes saved successfully!');
        },
        error: () => alert('Error saving notes')
      });
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
      alert('Please fill in treatment type');
      return;
    }

    this.odontogramService.addTreatmentPlan(this.currentOdontogram.id, this.treatmentForm)
      .subscribe({
        next: () => {
          // Reload odontogram to get updated tooth records with treatments
          this.loadPatientOdontogram();
          this.showTreatmentDialog = false;
          alert('Treatment plan added successfully!');
        },
        error: () => alert('Error adding treatment')
      });
  }

  updateTreatmentStatus(treatment: TreatmentPlanDto, newStatus: string): void {
    const completedDate = newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined;

    this.odontogramService.updateTreatmentStatus(treatment.id, newStatus, completedDate)
      .subscribe({
        next: () => {
          this.loadPatientOdontogram();
          alert('Treatment status updated!');
        },
        error: () => alert('Error updating treatment status')
      });
  }

  getToothName(toothNumber: string): string {
    const quadrant = toothNumber[0];
    const position = toothNumber[1];

    const quadrantNames: Record<string, string> = {
      '1': 'Upper Right',
      '2': 'Upper Left',
      '3': 'Lower Left',
      '4': 'Lower Right'
    };

    const positionNames: Record<string, string> = {
      '1': 'Central Incisor',
      '2': 'Lateral Incisor',
      '3': 'Canine',
      '4': 'First Premolar',
      '5': 'Second Premolar',
      '6': 'First Molar',
      '7': 'Second Molar',
      '8': 'Third Molar'
    };

    return `${quadrantNames[quadrant]} ${positionNames[position]}`;
  }

  getStatusLabel(status: ToothStatus): string {
    const labels: Record<ToothStatus, string> = {
      'HEALTHY': 'Healthy',
      'CARIOUS': 'Cavity',
      'FILLED': 'Filled',
      'MISSING': 'Missing',
      'CROWN': 'Crown',
      'BRIDGE': 'Bridge',
      'IMPLANT': 'Implant',
      'ROOT_CANAL': 'Root Canal',
      'FRACTURED': 'Fractured',
      'MOBILE': 'Mobile',
      'IMPACTED': 'Impacted'
    };
    return labels[status] || status;
  }
}
