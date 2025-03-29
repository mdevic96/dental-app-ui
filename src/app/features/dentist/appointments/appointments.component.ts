import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentDto } from '../../../core/appointment.model';

@Component({
  selector: 'app-appointments',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  upcomingAppointments: AppointmentDto[] = [];
  pastAppointments: AppointmentDto[] = [];
  selectedTab: string = 'upcoming';
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
      .subscribe(appointments => this.pastAppointments = appointments.filter(a => a.status !== 'SCHEDULED'));
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
