import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  OdontogramDto,
  CreateOdontogramRequest,
  UpdateToothRequest,
  CreateTreatmentPlanRequest,
  TreatmentPlanDto,
  ToothRecordDto
} from '../../../core/odontogram.model';

@Injectable({
  providedIn: 'root'
})
export class OdontogramService {
  private apiUrl = `${environment.apiBase}/odontograms`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  }

  createOdontogram(request: CreateOdontogramRequest): Observable<OdontogramDto> {
    return this.http.post<OdontogramDto>(this.apiUrl, request, { headers: this.getHeaders() });
  }

  getOdontogramsByPatient(patientId: number): Observable<OdontogramDto[]> {
    return this.http.get<OdontogramDto[]>(`${this.apiUrl}/patient/${patientId}`, { headers: this.getHeaders() });
  }

  getLatestOdontogram(patientId: number): Observable<OdontogramDto> {
    return this.http.get<OdontogramDto>(`${this.apiUrl}/patient/${patientId}/latest`, { headers: this.getHeaders() });
  }

  getOdontogramById(id: number): Observable<OdontogramDto> {
    return this.http.get<OdontogramDto>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateGeneralNotes(id: number, notes: string): Observable<OdontogramDto> {
    return this.http.patch<OdontogramDto>(
      `${this.apiUrl}/${id}/notes`,
      notes, { headers: this.getHeaders() }
    );
  }

  updateTooth(odontogramId: number, request: UpdateToothRequest): Observable<ToothRecordDto> {
    return this.http.patch<ToothRecordDto>(`${this.apiUrl}/${odontogramId}/teeth`, request, { headers: this.getHeaders() });
  }

  addTreatmentPlan(odontogramId: number, request: CreateTreatmentPlanRequest): Observable<TreatmentPlanDto> {
    return this.http.post<TreatmentPlanDto>(`${this.apiUrl}/${odontogramId}/treatments`, request, { headers: this.getHeaders() });
  }

  updateTreatmentStatus(treatmentPlanId: number, status: string, completedDate?: string): Observable<TreatmentPlanDto> {
    let url = `${this.apiUrl}/treatments/${treatmentPlanId}?status=${status}`;
    if (completedDate) {
      url += `&completedDate=${completedDate}`;
    }
    return this.http.patch<TreatmentPlanDto>(url, null, { headers: this.getHeaders() });
  }

  getPlannedTreatments(patientId: number): Observable<TreatmentPlanDto[]> {
    return this.http.get<TreatmentPlanDto[]>(`${this.apiUrl}/patient/${patientId}/planned-treatments`, { headers: this.getHeaders() });
  }

  deleteOdontogram(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
