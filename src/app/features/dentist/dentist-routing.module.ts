import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DentistDashboardComponent } from './dashboard/dashboard.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { ServicesComponent } from './services/services.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ProfileComponent } from './profile/profile.component';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  { path: '', component: DentistDashboardComponent, canActivate: [RoleGuard] },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [RoleGuard] },
  { path: 'services', component: ServicesComponent, canActivate: [RoleGuard] },
  { path: 'schedule', component: ScheduleComponent, canActivate: [RoleGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [RoleGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DentistRoutingModule { }
