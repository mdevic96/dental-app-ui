import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DentistServiceDto } from '../../../core/dentist-service.model';
import { TimeSlotDto } from '../../../core/timeslot.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DentalOffice } from '../../../core/dental-office.model';
import { DentistDto } from '../../../core/dentist.model';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

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
  selectedServiceId!: number;
  selectedDentistId!: number;
  selectedTimeSlotId!: number;
  dentalOfficeName: string = "";

  availableDentists: DentistDto[] = [];
  availableServices: any[] = [];
  availableTimeSlots: any[] = [];

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private http: HttpClient, private router: Router) { }

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

  loadAvailableTimeSlots() {
    if (!this.selectedDentistId) return;

    this.http.get<TimeSlotDto[]>(this.apiUrl + `/time-slots/dentist/${this.selectedDentistId}/available`).subscribe(
      (slots) => {
        this.availableTimeSlots = slots.map(slot => ({
          id: slot.id,
          startTime: new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      },
      (error) => {
        console.error('Error fetching time slots:', error);
      }
    );
  }

  confirmBooking() {
    if (!this.selectedServiceId || !this.selectedTimeSlotId || !this.selectedDentistId) {
      alert('Please select a service, time slot or dentist');
      return;
    }

    const appointmentData = {
      dentistId: this.selectedDentistId,
      serviceId: this.selectedServiceId,
      timeSlotId: this.selectedTimeSlotId,
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
