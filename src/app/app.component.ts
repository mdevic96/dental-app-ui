import { Component } from '@angular/core';
import { AuthService } from './features/auth/auth.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from "./features/language-selector/language-selector.component";
import { SearchBarComponent } from "./features/search-bar/search-bar.component";

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    CommonModule,
    TranslateModule,
    LanguageSelectorComponent,
    SearchBarComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: any;
  isHomePage: boolean = false;

  constructor(
    public authService: AuthService, 
    private router: Router) {
    this.user = this.authService.getUser();
    this.router.events.subscribe(() => {
      this.isHomePage = this.router.url === '/home' || this.router.url === '/';
    });
  }

  getLogoRedirect(): string {
    if (!this.authService.isAuthenticated()) {
      return '/home';
    }

    const userRoles = this.authService.getUserRoles();
    
    if (userRoles.name === 'ROLE_DENTIST') {
      return '/dentist';
    } else {
      return '/home';
    }
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/auth/login']);
  }
}

