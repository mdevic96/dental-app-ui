import { CommonModule } from '@angular/common';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap, tap } from 'rxjs';
import { City } from '../../core/city.model';
import { DentalOffice } from '../../core/dental-office.model';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { InfoComponent } from "../appointments/info/info.component";
import { DentistDto } from '../../core/dentist.model';
import { DentistServiceDto } from '../../core/dentist-service.model';
import { ServiceDto } from '../../core/service.model';
import { MunicipalityDto } from '../../core/municipality.model';
import { environment } from '../../../environments/environment';

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

  cities: City[] = [];
  municipalities: MunicipalityDto[] = [];
  selectedCityId: number | null = null;
  selectedMunicipalityId: number | null = null;
  searchQuery = new FormControl('');
  searchResults: DentalOffice[] = [];
  isLoading = false;
  showAccordion = false;

  showCityDropdown = false;
  selectedCityName: string | null = null;
  showMunicipalityDropdown = false;
  selectedMunicipalityName: string | null = null;

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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<City[]>(`${environment.apiBase}/cities`, { headers }).subscribe(
      data => this.cities = data
    );
  }

  searchDentalOffices(query: string = ''): Observable<DentalOffice[]> {
    this.isLoading = true;

    const params: any = {};
    if (query.trim()) {
      params.query = query;
    }
    if (this.selectedCityId) {
      params.cityId = this.selectedCityId;
    }
    if (this.selectedMunicipalityId) {
      params.municipalityId = this.selectedMunicipalityId;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.get<{ content: DentalOffice[] }>(environment.apiBase + '/dental-offices/search', { headers, params })
      .pipe(
        map(response => {
          if (response.content.length === 0) {
            this.searchResults = [];
          } else {
            this.searchResults = response.content;
          }
          return this.searchResults;
        }),

        tap(() => this.isLoading = false),
        catchError(() => {
          this.isLoading = false;
          this.searchResults = [];
          return of([]);
        })
      );
  }

  triggerSearch() {
    this.isLoading = true;
    this.searchDentalOffices(this.searchQuery.value!).subscribe({
      next: () => this.isLoading = false,
      error: () => {this.isLoading = false; this.searchResults = []}
    });
  }

  toggleAccordion() {
    this.showAccordion = !this.showAccordion;
  }

  toggleMunicipality(city: City) {
    if (this.selectedCityId !== city.id) {
      this.selectedCityId = city.id;
      this.selectedCityName = city.name;
      this.fetchMunicipalities();
    } else {
      this.selectedCityId = null;
      this.selectedCityName = null;
      this.municipalities = [];
    }
  }

  selectCity(city: City | null) {
    this.selectedCityId = city?.id || null;
    this.selectedCityName = city ? city.name : null;
    this.selectedMunicipalityId = null;
    this.selectedMunicipalityName = null;

    if (this.selectedCityId) {
      this.fetchMunicipalities();
    } else {
      this.municipalities = [];
    }
    this.showAccordion = false;
    this.triggerSearch();
  }

  selectMunicipality(municipality: MunicipalityDto | null) {
    this.selectedMunicipalityId = municipality?.id || null;
    this.selectedMunicipalityName = municipality ? municipality.name : null;
    this.showAccordion = false;
    this.triggerSearch();
  }

  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCityId = target.value ? Number(target.value) : null;
    this.selectedMunicipalityId = null; // Reset municipality

    if (this.selectedCityId) {
      this.fetchMunicipalities();
    } else {
      this.municipalities = [];
    }

    this.triggerSearch();
  }

  onMunicipalityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedMunicipalityId = target.value ? Number(target.value) : null;
    this.triggerSearch();
  }

  fetchMunicipalities() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<MunicipalityDto[]>(`${environment.apiBase}/municipalities/city/${this.selectedCityId}`, { headers })
      .subscribe(
        data => this.municipalities = data);
  }

  openInfoDialog(office: DentalOffice) {
    this.selectedOffice = office;
    this.showInfoDialog = true;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<DentistDto[]>(`${environment.apiBase}/dentists/dental-office/${office.id}`, { headers }).subscribe(dentists => {
      this.selectedOfficeDentists = dentists;
    });

    this.http.get<DentistServiceDto[]>(`${environment.apiBase}/services/dental-office/${office.id}`, { headers }).subscribe(services => {
      this.selectedOfficeServices = services.map(s => s.service);
    });
  }

  closeInfoDialog() {
    this.showInfoDialog = false;
  }
}
