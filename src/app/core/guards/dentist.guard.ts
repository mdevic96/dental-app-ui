import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DentistGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking route', state.url);
    
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: User is not authenticated. Redirecting to login.');
      this.router.navigate(['/auth/login']);
      return false;
    }
  
    const roles = route.data['roles'];
    console.log('AuthGuard: Required roles:', roles);
    
    if (roles && !this.authService.hasRole(roles[0])) {
      console.log('AuthGuard: User lacks required roles. Redirecting to home.');
      this.router.navigate(['/home']);
      return false;
    }
  
    console.log('AuthGuard: Access granted to', state.url);
    return true;
  }
  
}
