import { Routes } from '@angular/router';
import { DentistDashboardComponent } from './features/dentist/dashboard/dashboard.component';
import { AppointmentsComponent } from './features/dentist/appointments/appointments.component';
import { DentistGuard } from './core/guards/dentist.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./features/home/home.routes').then(m => m.default) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.default) },
  { path: 'appointments', loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.default) },
  { path: 'appointments/confirmation', loadComponent: () => import('./features/appointments/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },

  // Dentist routes
  { path: 'dentist', component: DentistDashboardComponent, canActivate: [DentistGuard], data: { roles: ['ROLE_DENTIST'] } },
  { path: 'dentist/appointments', component: AppointmentsComponent, canActivate: [DentistGuard], data: { roles: ['ROLE_DENTIST'] } }

];
