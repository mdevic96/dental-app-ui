export interface TimeSlotDto {
    id: number;
    dentistId: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}  