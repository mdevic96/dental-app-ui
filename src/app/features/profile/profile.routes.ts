import { Routes } from '@angular/router';
//import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../auth/auth.guard';

export default [
  //{ path: '', component: ProfileComponent, canActivate: [AuthGuard] }  // Protect profile route
] as Routes;
