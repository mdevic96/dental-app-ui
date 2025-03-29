import { Routes } from '@angular/router';
import { DentistDashboardComponent } from './features/dentist/dashboard/dashboard.component';
import { AppointmentsComponent } from './features/dentist/appointments/appointments.component';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadChildren: () => import('./features/home/home.routes').then(m => m.default),
    canActivate: [RoleGuard], 
    data: { roles: ['ROLE_ADMIN', 'ROLE_PATIENT'] } 
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.default)
  },
  { 
    path: 'appointments', 
    loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.default),
    canActivate: [RoleGuard], 
    data: { roles: ['ROLE_ADMIN', 'ROLE_PATIENT'] }  
  },
  { 
    path: 'appointments/confirmation', 
    loadComponent: () => import('./features/appointments/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
    canActivate: [RoleGuard], 
    data: { roles: ['ROLE_ADMIN', 'ROLE_PATIENT'] }  
  },

  // Dentist routes
  { 
    path: 'dentist', 
    component: DentistDashboardComponent, 
    canActivate: [RoleGuard], 
    data: { roles: ['ROLE_DENTIST'] } 
  },
  { 
    path: 'dentist/appointments', 
    component: AppointmentsComponent, 
    canActivate: [RoleGuard], 
    data: { roles: ['ROLE_DENTIST'] } 
  }

];
