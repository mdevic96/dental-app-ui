import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DentalOffice } from '../../../core/dental-office.model';
import { DentistDto } from '../../../core/dentist.model';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../../environments/environment';

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

  selectedOfficeId!: number;
  selectedDentistId!: number | null;
  selectedDate!: string | null;
  selectedStartTime!: string | null;
  canConfirm: boolean = false;

  dentalOfficeName: string = "";

  availableTimes: string[] = [];
  availableDentists: DentistDto[] = [];

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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<DentistDto[]>(`${environment.apiBase}/dentists/dental-office/${this.selectedOfficeId}`, { headers }).subscribe(
      dentists => {
        this.availableDentists = dentists;
        if (dentists.length === 1) {
          this.selectedDentistId = dentists[0].id;
        }
      });
  }

  getDentalOfficeName() {
    if (!this.selectedOfficeId) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<DentalOffice>(`${environment.apiBase}/dental-offices/${this.selectedOfficeId}`, { headers })
      .subscribe(result => {
        this.dentalOfficeName = result.name;
      }
      );
  }

  loadAvailableTimes() {
    if (!this.selectedDentistId || !this.selectedDate) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<string[]>(`${environment.apiBase}/work-schedule/dentist/${this.selectedDentistId}/${this.selectedDate}`, { headers })
      .subscribe(
        (times) => {
          this.availableTimes = times;
        });
  }


  confirmBooking() {
    if (!this.canConfirm) {
      return;
    }

    const patientId = this.authService.getUser().id;

    const appointmentData = {
      dentistId: this.selectedDentistId,
      serviceId: null,
      appointmentDate: this.selectedDate,
      startTime: this.selectedStartTime,
      patientId: patientId
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.post(`${environment.apiBase}/appointments`, appointmentData, { headers })
      .subscribe(
        response => {
          this.openConfirmationDialog(response);
        });
  }

  onDentistChange() {
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
