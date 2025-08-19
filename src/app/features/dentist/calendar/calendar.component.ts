import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { CalendarOptions, DateSelectArg, EventInput } from '@fullcalendar/core/index.js';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DentistServiceDto } from '../../../core/dentist-service.model';
import { UserDto } from '../../../core/user.model';
import { DentalOffice } from '../../../core/dental-office.model';
import { AuthService } from '../../auth/auth.service';
import { AppointmentDto } from '../../../core/appointment.model';
import srLocale from '@fullcalendar/core/locales/sr';
import enLocale from '@fullcalendar/core/locales/en-gb';
import ruLocale from '@fullcalendar/core/locales/ru';
import deLocale from '@fullcalendar/core/locales/de';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../../shared/error-dialog/error-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    FullCalendarModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  selectedStart: string | null = null;
  selectedEnd: string | null = null;
  showCreateModal = false;

  appointmentForm!: FormGroup;

  availableServices: DentistServiceDto[] = [];
  availablePatients: UserDto[] = [];

  selectedAppointment: AppointmentDto | null = null;
  showEditModal = false;
  editForm!: FormGroup;

  appointments: EventInput[] = [];
  currentView: string = "timeGridWeek";
  calendarStart: string | null = null;
  calendarEnd: string | null = null;

  officeId!: number;

  legendItems: { id: number, name: string; color: string }[] = [];

  filteredPatients: UserDto[] = [];
  filteredServices: DentistServiceDto[] = [];

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      serviceId: ['', Validators.required],
      notes: ['']
    });
  }

  fetchAppointments(start: string, end: string) {
    const dentistId = this.authService.getUser().id;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  
    const params = {
      startDate: start,
      endDate: end,
      page: 0,
      size: 100
    };
  
    this.http.get<{ content: AppointmentDto[] }>(
      `${environment.apiBase}/appointments/dentist/${dentistId}/date-range`,
      { headers, params }
    ).subscribe(response => {
      this.appointments = response.content.map(app => ({
        title: `${app.patient.firstName} ${app.patient.lastName} - ${app.service.name}`,
        start: `${app.appointmentDate}T${app.startTime}`,
        end: `${app.appointmentDate}T${app.endTime}`,
        extendedProps: {
          id: app.id,
          notes: app.notes
        },
        color: this.getServiceColor(app.service.id),
        backgroundColor: this.getServiceColor(app.service.id),
        borderColor: this.getServiceColor(app.service.id),
        allDay: false
      }));

      const seenServiceIds = new Set<number>();

      this.legendItems = response.content
        .filter(app => {
          if (seenServiceIds.has(app.service.id)) return false;
          seenServiceIds.add(app.service.id);
          return true;
        })
        .map(app => ({
          id: app.service.id,
          name: app.service.name,
          color: this.getServiceColor(app.service.id)
        }));
  
      // Re-assign events dynamically
      const options = this.calendarOptions();
      options.events = this.appointments;
      this.calendarOptions.set(options);
    });
  }

  fetchDentalOfficeId() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.get<DentalOffice>(`${environment.apiBase}/dentists/me/office`, { headers })
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

    this.http.get<DentistServiceDto[]>(`${environment.apiBase}/services/dental-office/${this.officeId}`, { headers }).subscribe(data => {
      this.availableServices = data;
      this.filteredServices = data;
    });
  }
  
  fetchPatients() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    this.http.get<UserDto[]>(`${environment.apiBase}/patients/dental-office/${this.officeId}`, { headers }).subscribe(data => {
      this.availablePatients = data;
      this.filteredPatients = data;
    });
  }
  
  ngOnInit(): void {
    this.fetchDentalOfficeId();

    this.editForm = this.fb.group({
      notes: [''],
      status: ['', Validators.required]
    });

    // Add listeners for filtering
    this.appointmentForm.get('patientId')?.valueChanges.subscribe(value => {
      this.filterPatients(value);
    });

    this.appointmentForm.get('serviceId')?.valueChanges.subscribe(value => {
      this.filterServices(value);
    });

    // Listen for custom language change event
    window.addEventListener('languageChanged', (event: any) => {
      const lang = event.detail || 'sr';
      const options = this.calendarOptions();
      options.locale = lang;
      this.calendarOptions.set({ ...options });
    });
  }

  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin
    ],
    locales: [srLocale, enLocale, ruLocale, deLocale],
    locale: localStorage.getItem('lang') || 'sr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'timeGridWeek',
    viewDidMount: (arg) => {
      this.currentView = arg.view.type;
    },
    eventContent: this.renderEventContent.bind(this),
    eventDidMount: this.renderEventTooltip.bind(this),  
    slotDuration: '00:15:00',
    slotLabelInterval: '00:15:00', 
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }, 
    slotMinTime: "08:00:00",
    slotMaxTime: "20:00:00",
    weekends: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    datesSet: (info) => {
      this.calendarStart = info.startStr;
      this.calendarEnd = info.endStr;
      this.fetchAppointments(this.calendarStart, this.calendarEnd);
    }
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
  
    this.http.post<AppointmentDto>(`${environment.apiBase}/appointments`, payload, { headers }).subscribe({
      next: (newAppointment) => {
        this.showCreateModal = false;
        this.appointmentForm.reset();

        const serviceColor = this.getServiceColor(newAppointment.service.id);

        const event = {
          title: `${newAppointment.patient.firstName} ${newAppointment.patient.lastName} - ${newAppointment.service.name}`,
          start: `${newAppointment.appointmentDate}T${newAppointment.startTime}`,
          end: `${newAppointment.appointmentDate}T${newAppointment.endTime}`,
          extendedProps: {
            id: newAppointment.id,
            notes: newAppointment.notes
          },
          backgroundColor: serviceColor,
          borderColor: serviceColor,
          color: serviceColor,
          allDay: false,
        };

        this.appointments.push(event);
    
        const existsInLegend = this.legendItems.some(item => item.name === newAppointment.service.name);
        if (!existsInLegend) {
          this.legendItems.push({
            id: newAppointment.service.id,
            name: newAppointment.service.name,
            color: serviceColor
          });
        }

        // Rebind to calendar
        const options = this.calendarOptions();
        options.events = [...this.appointments];
        this.calendarOptions.set(options);
      },
      error: (err) => {
        console.error(err);
        const errorMessage = err.error?.message;
        this.dialog.open(ErrorDialogComponent, {
          data: { message: errorMessage }
        });
      }
    });
  }

  updateAppointment() {
    if (!this.selectedAppointment) return;
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  
    const { notes, status } = this.editForm.value;
  
    this.http.patch<AppointmentDto>(
      `${environment.apiBase}/appointments/${this.selectedAppointment.id}`,
      { notes, status }, { headers }
    ).subscribe(() => {
      this.showEditModal = false;
      if (this.calendarStart && this.calendarEnd) {
        this.fetchAppointments(this.calendarStart, this.calendarEnd);
      }
    });
  }
  
  handleEventClick(clickInfo: any) {
    const serviceId = clickInfo.event.extendedProps['id'];
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<AppointmentDto>(`${environment.apiBase}/appointments/${serviceId}`, { headers }).subscribe(appointment => {
      this.selectedAppointment = appointment;
      this.showEditModal = true;

      this.editForm.patchValue({
        notes: appointment.notes,
        status: appointment.status
      });
    });
  }  

  handleDateSelect(selectInfo: DateSelectArg) {
    this.selectedStart = selectInfo.startStr;
    this.selectedEnd = selectInfo.endStr;
    this.showCreateModal = true;
  }

  onCancelClick() {
    this.showCreateModal = false

    this.appointmentForm.reset();
    this.selectedStart = null;
    this.selectedEnd = null;
  }

  renderEventContent(arg: any) {
    const time = arg.timeText;
    const title = arg.event.title;

    const patient = title.split(' - ');

    if (this.currentView === 'dayGridMonth') {
      // Shorter format for Month view
      const firstName = patient[0]?.split(' ')[0] || title;
      return {
        html: `<div class="fc-event-custom">
                 <b>${time}</b> <i>${firstName}</i>
               </div>`
      };
    }

    // Full format for week/day view
    return {
      html: `<div class="fc-event-custom">
               <b>${time}</b><br/>
               <i>${title}</i>
             </div>`
    };
  }

  renderEventTooltip(arg: any) {
    const el = arg.el;
    const time = arg.timeText;
    const title = arg.event.title;
    const patient = title.split(' - ');
    const firstName = patient[0];
    const notes = arg.event.extendedProps['notes'];

    const tooltipText = `${firstName}\n` + `${patient[1]}\n` + `${time}\n` + `${notes || ''}`;

    el.setAttribute('title', tooltipText.trim());
  }
  
  getServiceColor(serviceId: number): string {
    const hue = (serviceId * 137) % 360;
    const saturation = 60 + (serviceId % 20);
    const lightness = 65;
  
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  filterPatients(searchTerm: string) {
    const lower = searchTerm?.toLowerCase?.() || '';
    this.filteredPatients = this.availablePatients.filter(p =>
      (`${p.firstName} ${p.lastName}`).toLowerCase().includes(lower)
    );
  }

  filterServices(query: string) {
    const seen = new Set<number>();
    this.filteredServices = this.availableServices
      .filter(s => {
        const name = s.service.name.toLowerCase();
        return name.includes(query.toLowerCase()) && !seen.has(s.service.id);
      })
      .filter(s => {
        const isNew = !seen.has(s.service.id);
        seen.add(s.service.id);
        return isNew;
      });
  }  

  getPatientNameById(id: any): string {
    const match = this.availablePatients.find(p => p.id == id);
    return match ? `${match.firstName} ${match.lastName}` : '';
  }
  
  getServiceNameById(id: any): string {
    const match = this.availableServices.find(s => s.service.id == id);
    return match ? match.service.name : '';
  }

  onPatientInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.appointmentForm.get('patientId')?.setValue(value);
    this.filterPatients(value);
  }
  
  onServiceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.appointmentForm.get('serviceId')?.setValue(value);
    this.filterServices(value);
  }
}
