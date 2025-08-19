import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DentistDashboardComponent implements OnInit {

  dentistName = '';
  totalAppointments = 0;
  completedAppointments = 0;
  avgRating = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${environment.apiBase}/dentists/dashboard`, { headers }).subscribe(data => {
      this.dentistName = data.name;
      this.totalAppointments = data.totalAppointments;
      this.completedAppointments = data.completedAppointments;
      this.avgRating = data.avgRating.toFixed(1);
    });
  }

  navigateTo(route: string) {
    this.router.navigate([`/dentist/${route}`]);
  }
}
