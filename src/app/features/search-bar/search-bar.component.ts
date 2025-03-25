import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { City } from '../../core/city.model';
import { DentalOffice } from '../../core/dental-office.model';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { InfoComponent } from "../appointments/info/info.component";
import { DentistDto } from '../../core/dentist.model';
import { DentistServiceDto } from '../../core/dentist-service.model';
import { ServiceDto } from '../../core/service.model';

@Component({
  selector: 'app-search-bar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InfoComponent
],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  cities: City[] = [];
  selectedCityId: number | null = null;
  searchQuery = new FormControl('');
  searchResults: DentalOffice[] = [];
  isLoading = false;

  // info dialog
  showInfoDialog = false;
  selectedOffice: DentalOffice | null = null;
  selectedOfficeDentists: DentistDto[] = [];
  selectedOfficeServices: ServiceDto[] = [];

  constructor(private http: HttpClient, public authService: AuthService,
    private router: Router) { }

  bookNow(dentalOfficeId: number) {
    this.router.navigate(['/appointments/book-now'], { queryParams: { officeId: dentalOfficeId } });
  }

  ngOnInit(): void {
    this.fetchCities();

    this.searchQuery.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(query => this.searchDentalOffices(query!))
      )
      .subscribe(results => {
        this.searchResults = results;
        this.isLoading = false;
      });
  }

  fetchCities() {
    this.http.get<City[]>(this.apiUrl + '/cities').subscribe(
      data => this.cities = data,
      error => console.error('Error fetching cities:', error)
    );
  }

  searchDentalOffices(query: string): Observable<DentalOffice[]> {
    if (!query.trim()) {
      this.searchResults = [];
      return of([]);
    }

    this.isLoading = true;

    const params: any = { query };
    if (this.selectedCityId) params.cityId = this.selectedCityId;

    return this.http.get<{ content: DentalOffice[] }>(this.apiUrl + '/dental-offices/search', { params })
      .pipe(
        switchMap(response => {
          this.isLoading = false;
          this.searchResults = response.content;
          return of(response.content);
        })
      );
  }

  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newCityId = target.value ? Number(target.value) : null;

    if (this.selectedCityId !== newCityId) {
      this.selectedCityId = newCityId;

      if (this.searchQuery.value?.trim()) {
        this.isLoading = true;

        this.searchDentalOffices(this.searchQuery.value!).subscribe({
          next: () => this.isLoading = false,
          error: () => this.isLoading = false
        });
      }
    }
  }

  openInfoDialog(office: DentalOffice) {
    this.selectedOffice = office;
    this.showInfoDialog = true;
  
    this.http.get<DentistDto[]>(`${this.apiUrl}/dentists/dental-office/${office.id}`).subscribe(dentists => {
      this.selectedOfficeDentists = dentists;
    });
  
    this.http.get<DentistServiceDto[]>(`${this.apiUrl}/services/dental-office/${office.id}`).subscribe(services => {
      this.selectedOfficeServices = services.map(s => s.service);
    });
  }

  closeInfoDialog() {
    this.showInfoDialog = false;
  }
}
