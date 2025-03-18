import { ServiceDto } from "./service.model";

export interface DentistServiceDto {
    id: number;
    dentistId: number;
    service: ServiceDto;
    price: number;
  }