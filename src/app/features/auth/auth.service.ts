import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {LoginResponse} from '../../core/login-response.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBase}/auth/login`, credentials);
  }

  register(user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    roles: string[]
  }): Observable<any> {
    return this.http.post(`${environment.apiBase}/auth/register`, user);
  }

  loadDentistInfo(userId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.get<any>(`${environment.apiBase}/dentists/user/${userId}`, {headers})
      .pipe(
        tap(dentist => {
          localStorage.setItem('dentistInfo', JSON.stringify(dentist));
        })
      );
  }

  getDentistInfo(): any {
    const stored = localStorage.getItem('dentistInfo');
    return stored ? JSON.parse(stored) : null;
  }

  getDentistId(): number | null {
    const dentist = this.getDentistInfo();
    return dentist ? dentist.id : null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('dentistInfo');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRoles() {
    const user = this.getUser();
    return user.roles[0];
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.name === role;
  }
}
