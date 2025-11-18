import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../core/login-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBase}/auth/login`, credentials);
  }

  register(user: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; roles: string[] }): Observable<any> {
    return this.http.post(`${environment.apiBase}/auth/register`, user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
