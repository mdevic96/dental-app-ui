import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentDto } from '../../../core/appointment.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments',
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  upcomingAppointments: AppointmentDto[] = [];
  pastAppointments: AppointmentDto[] = [];
  selectedTab: string = 'upcoming';
  sortOrder: 'asc' | 'desc' = 'desc';

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    const dentistId = this.authService.getUser().id;
    this.http.get<AppointmentDto[]>(`${this.apiUrl}/appointments/dentist/${dentistId}/upcoming`, { headers })
      .subscribe(appointments => this.upcomingAppointments = appointments.filter(a => a.status === 'SCHEDULED'));

    this.http.get<AppointmentDto[]>(`${this.apiUrl}/appointments/dentist/${dentistId}`, { headers })
      .subscribe(appointments => {
        const filtered = appointments.filter(a => a.status !== 'SCHEDULED');
        this.pastAppointments = this.sortAppointmentsByStatus(filtered);
      });
  }

  sortPastAppointments(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.pastAppointments = this.sortAppointmentsByStatus(this.pastAppointments);
  }
  
  sortAppointmentsByStatus(appointments: AppointmentDto[]): AppointmentDto[] {
    return [...appointments].sort((a, b) => {
      const statusA = a.status.toUpperCase();
      const statusB = b.status.toUpperCase();
      return this.sortOrder === 'asc' ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
    });
  }

  updateStatus(id: number, status: 'COMPLETED' | 'CANCELLED' | 'SCHEDULED'): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    this.http.post(`${this.apiUrl}/appointments/${id}/${status}`, { }, { headers })
      .subscribe(() => {
        alert(`Appointment marked as ${status.toLowerCase()}!`);
        this.loadAppointments();
      });
  }

}
