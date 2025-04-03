export interface CreateAppointmentRequest {
    patientEmail: string;
    serviceName: string;
    notes: string;
    appointmentDate: string; // format: yyyy-MM-dd
    startTime: string; // format: HH:mm
    endTime: string;   // format: HH:mm
  }
  