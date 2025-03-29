import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'];
    const user = this.authService.getUser();

    if (!user || !this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const userHasRole = user.roles?.some((role: any) => {
      const roleName = typeof role === 'string' ? role : role?.name;
      return expectedRoles.includes(roleName);
    });

    if (!userHasRole) {
      // Redirect based on role
      if (user.roles?.some((r: any) => (typeof r === 'string' ? r === 'ROLE_DENTIST' : r?.name === 'ROLE_DENTIST'))) {
        this.router.navigate(['/dentist']);
      } else {
        this.router.navigate(['/home']);
      }
      return false;
    }

    return true;
  }
}

