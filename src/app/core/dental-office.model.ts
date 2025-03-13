import { City } from "./city.model";

export interface DentalOffice {
    id: number;
    name: string;
    address: string;
    city: City;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    rating?: number;
}