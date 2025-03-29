export interface AppointmentDto {
    id: number;
    patient: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    };
    service: {
      name: string;
      durationMinutes: number;
    };
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    notes?: string;
  }
  