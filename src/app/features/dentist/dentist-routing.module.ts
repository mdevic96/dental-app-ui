import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DentistDashboardComponent } from './dashboard/dashboard.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { ServicesComponent } from './services/services.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ProfileComponent } from './profile/profile.component';
import { DentistGuard } from '../../core/guards/dentist.guard';

const routes: Routes = [
  { path: '', component: DentistDashboardComponent, canActivate: [DentistGuard] },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [DentistGuard] },
  { path: 'services', component: ServicesComponent, canActivate: [DentistGuard] },
  { path: 'schedule', component: ScheduleComponent, canActivate: [DentistGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [DentistGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DentistRoutingModule { }
