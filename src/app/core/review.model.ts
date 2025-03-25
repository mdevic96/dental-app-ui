export interface Review {
    id: number;
    patient: {
      firstName: string;
      lastName: string;
    };
    dentistId: number;
    rating: number;
    comment: string;
    createdAt: string;
  }  