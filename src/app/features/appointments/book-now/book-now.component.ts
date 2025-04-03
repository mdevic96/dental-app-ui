import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DentistServiceDto } from '../../../core/dentist-service.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DentalOffice } from '../../../core/dental-office.model';
import { DentistDto } from '../../../core/dentist.model';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-book-now',
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './book-now.component.html',
  styleUrl: './book-now.component.css'
})
export class BookNowComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api';

  selectedOfficeId!: number;
  selectedServiceId!: number | null;
  selectedDentistId!: number | null;
  selectedDate!: string | null;
  selectedStartTime!: string | null;
  canConfirm: boolean = false;

  dentalOfficeName: string = "";

  availableTimes: string[] = [];
  availableDentists: DentistDto[] = [];
  availableServices: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private dialog: MatDialog, 
    private http: HttpClient, 
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedOfficeId = params['officeId'];
      if (this.selectedOfficeId) {
        this.getDentalOfficeName();
        this.loadAvailableDentists();
      }
    });
  }

  loadAvailableDentists() {
    if (!this.selectedOfficeId) return;

    this.http.get<DentistDto[]>(this.apiUrl + `/dentists/dental-office/${this.selectedOfficeId}`).subscribe(
      (dentists) => {
        this.availableDentists = dentists;
        if (dentists.length === 1) {
          this.selectedDentistId = dentists[0].id;
        }
      },
      (error) => {
        console.error('Error fetching dentists:', error);
      }
    );
  }

  loadAvailableServices() {
    if (!this.selectedOfficeId) return;

    this.http.get<DentistServiceDto[]>(this.apiUrl + `/services/dentist/${this.selectedOfficeId}`).subscribe(
      (services) => {
        this.availableServices = services.map(service => ({
          id: service.service.id,
          name: service.service.name,
          price: service.price
        }));
      },
      (error) => {
        console.error('Error fetching services:', error);
      }
    );
  }

  getDentalOfficeName() {
    if (!this.selectedOfficeId) return;

    this.http.get<DentalOffice>(this.apiUrl + `/dental-offices/${this.selectedOfficeId}`)
      .subscribe(result => {
        this.dentalOfficeName = result.name;
      }
      );
  }

  loadAvailableTimes() {
    if (!this.selectedDentistId || !this.selectedDate) return;

    this.http.get<string[]>(`${this.apiUrl}/work-schedule/dentist/${this.selectedDentistId}/${this.selectedDate}`)
      .subscribe(
        (times) => {
          this.availableTimes = times;
        },
        (error) => {
          console.error('Error fetching available times:', error);
        }
      );
  }


  confirmBooking() {
    if (!this.canConfirm) {
      return;
    }

    const patientId = this.authService.getUser().id;

    const appointmentData = {
      dentistId: this.selectedDentistId,
      serviceId: this.selectedServiceId,
      appointmentDate: this.selectedDate,
      startTime: this.selectedStartTime,
      patientId: patientId
  };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${this.apiUrl}/appointments`, appointmentData, { headers })
      .subscribe(
        response => {
          this.openConfirmationDialog(response);
        },
        error => {
          console.error('Error booking appointment:', error);
          alert('Failed to book appointment.');
        }
      );
  }

  onDentistChange() {
    this.selectedServiceId = null;
    this.selectedDate = null;
    this.selectedStartTime = null;
    this.availableServices = [];
    this.availableTimes = [];
  
    if (this.selectedDentistId) {
      this.loadAvailableServices();
    }

    this.validateForm();
  }

  onServiceChange() {
    this.selectedDate = null;
    this.selectedStartTime = null;
    this.availableTimes = [];

    this.validateForm();
  }
  
  onDateChange() {
    this.selectedStartTime = null;
    this.availableTimes = [];
  
    if (this.selectedDate) {
      this.loadAvailableTimes();
      this.validateForm();
    }
  }

  validateForm() {
    this.canConfirm =
      !!this.selectedDentistId &&
      !!this.selectedServiceId &&
      !!this.selectedDate &&
      !!this.selectedStartTime;
  }

  openConfirmationDialog(appointment: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '400px',
      data: { appointment }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

}
