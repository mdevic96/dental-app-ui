import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../../environments/environment';
import {
  CreatePatientProfileRequest,
  PatientProfileDto,
  UpdatePatientProfileRequest
} from '../../../core/odontogram.model';

@Injectable({
  providedIn: 'root'
})
export class PatientProfileService {

  private apiUrl = `${environment.apiBase}/patients`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  /**
   * Get patient profile by user ID
   */
  getProfile(userId: number): Observable<PatientProfileDto> {
    return this.http.get<PatientProfileDto>(
      `${this.apiUrl}/${userId}/profile`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Create patient profile
   */
  createProfile(userId: number, request: CreatePatientProfileRequest): Observable<PatientProfileDto> {
    return this.http.post<PatientProfileDto>(
      `${this.apiUrl}/${userId}/profile`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update patient profile
   */
  updateProfile(userId: number, request: UpdatePatientProfileRequest): Observable<PatientProfileDto> {
    return this.http.put<PatientProfileDto>(
      `${this.apiUrl}/${userId}/profile`,
      request,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Check if patient profile exists
   */
  profileExists(userId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${userId}/profile/exists`,
      { headers: this.getHeaders() }
    );
  }
}
