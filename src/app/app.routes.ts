import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./features/home/home.routes').then(m => m.default) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.default) },
  { path: 'dentists', loadChildren: () => import('./features/dentists/dentists.routes').then(m => m.default) },
  { path: 'appointments', loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.default) },
  { path: 'appointments/confirmation', loadComponent: () => import('./features/appointments/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
  { path: 'profile', loadChildren: () => import('./features/profile/profile.routes').then(m => m.default) }
];
