import { Component } from '@angular/core';
import { AuthService } from './features/auth/auth.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: any;
  dropdownOpen = false;
  currentFlag = localStorage.getItem('flag') || 'sr';
  languages = [
    { code: 'en', name: 'English', flag: '/flags/gb.png' },
    { code: 'sr', name: 'Srpski', flag: '/flags/rs.png' },
    { code: 'ru', name: 'Русский', flag: '/flags/ru.png' },
    { code: 'de', name: 'Deutsch', flag: '/flags/de.png' }
  ];

  constructor(
    public authService: AuthService, 
    private router: Router,
    private translate: TranslateService) {
    this.user = this.authService.getUser();

    this.translate.setDefaultLang('sr');
    this.translate.use(localStorage.getItem('lang') || 'sr');
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  changeLanguage(lang: string, flag: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    localStorage.setItem('flag', flag);
    this.currentFlag = flag;
    this.dropdownOpen = false;
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/auth/login']);
  }
}

