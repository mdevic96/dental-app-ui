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
  languages = [
    { code: 'en', name: 'English', flag: '/flags/gb.png' },
    { code: 'sr', name: 'Srpski', flag: '/flags/rs.png' },
    { code: 'ru', name: 'Русский', flag: '/flags/ru.png' },
    { code: 'de', name: 'Deutsch', flag: '/flags/de.png' }
  ];

  currentFlag = localStorage.getItem('flag') || this.languages.find(lang => lang.code === 'sr')?.flag!;
  currentLang = localStorage.getItem('lang') || this.languages.find(lang => lang.code === 'sr')?.code!;
  
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('sr');
    this.translate.use(localStorage.getItem('lang') || 'sr');
    localStorage.setItem('flag', this.currentFlag);
    localStorage.setItem('lang', this.currentLang);
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

    // Emit a custom event to notify calendar
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  }

}
