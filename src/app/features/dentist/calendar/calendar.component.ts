import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { CalendarOptions, DateSelectArg } from '@fullcalendar/core/index.js';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DentistServiceDto } from '../../../core/dentist-service.model';
import { UserDto } from '../../../core/user.model';
import { DentalOffice } from '../../../core/dental-office.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    FullCalendarModule,
    ReactiveFormsModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  selectedStart: string | null = null;
  selectedEnd: string | null = null;
  showCreateModal = false;

  appointmentForm!: FormGroup;
  apiUrl = 'http://localhost:8080/api';

  availableServices: DentistServiceDto[] = [];
  availablePatients: UserDto[] = [];

  officeId!: number;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      serviceId: ['', Validators.required],
      notes: ['']
    });
  }

  fetchDentalOfficeId() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.get<DentalOffice>(`${this.apiUrl}/dentists/me/office`, { headers })
    .subscribe(office => {
      this.officeId = office.id;
      this.fetchPatients();
      this.fetchServices();
    });
  }

  fetchServices() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.get<DentistServiceDto[]>(`${this.apiUrl}/services/dental-office/${this.officeId}`, { headers }).subscribe(data => {
      this.availableServices = data;
    });
  }
  
  fetchPatients() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.get<UserDto[]>(`${this.apiUrl}/patients/dental-office/${this.officeId}`, { headers }).subscribe(data => {
      this.availablePatients = data;
    });
  }
  
  ngOnInit(): void {
    this.fetchDentalOfficeId();
  }

  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'timeGridWeek',
    slotMinTime: "08:00:00",
    slotMaxTime: "20:00:00",
    weekends: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this)
  });

  createAppointment() {
    if (this.appointmentForm.invalid || !this.selectedStart || !this.selectedEnd) return;
  
    const formValues = this.appointmentForm.value;
    const appointmentDate = this.selectedStart.split('T')[0];
    const startTime = this.selectedStart.split('T')[1].substring(0, 5);
    const endTime = this.selectedEnd.split('T')[1].substring(0, 5);
    const dentistId = this.authService.getUser().id;
  
    const payload = {
      patientId: formValues.patientId,
      serviceId: formValues.serviceId,
      dentistId: dentistId,
      appointmentDate: appointmentDate,
      startTime: startTime,
      endTime: endTime,
      notes: formValues.notes
    };
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  
    this.http.post(`${this.apiUrl}/appointments`, payload, { headers }).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.appointmentForm.reset();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  

  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr)
  }

  handleEventClick(clickInfo: any) {
    alert('event click! ' + clickInfo)
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.selectedStart = selectInfo.startStr;
    this.selectedEnd = selectInfo.endStr;
    this.showCreateModal = true;
  }
}
