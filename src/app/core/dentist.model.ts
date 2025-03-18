import { DentalOffice } from "./dental-office.model";
import { DentistServiceDto } from "./dentist-service.model";
import { UserDto } from "./user.model";

export interface DentistDto {
    id: number;
    user: UserDto;
    dentalOffice: DentalOffice;
    specialization: string;
    description: string;
    yearsOfExperience: number;
    services: DentistServiceDto[];
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
  }