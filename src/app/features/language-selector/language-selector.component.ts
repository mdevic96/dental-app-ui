import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  imports: [
    CommonModule
  ],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css'
})
export class LanguageSelectorComponent {
  dropdownOpen = false;
    currentFlag = localStorage.getItem('flag') || 'sr';
    languages = [
      { code: 'en', name: 'English', flag: '/flags/gb.png' },
      { code: 'sr', name: 'Srpski', flag: '/flags/rs.png' },
      { code: 'ru', name: 'Русский', flag: '/flags/ru.png' },
      { code: 'de', name: 'Deutsch', flag: '/flags/de.png' }
    ];

    constructor(private translate: TranslateService) {
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

}
