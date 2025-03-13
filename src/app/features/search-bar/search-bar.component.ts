import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { City } from '../../core/city.model';
import { DentalOffice } from '../../core/dental-office.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-bar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {

  private apiUrl = 'http://localhost:8080/api';

  cities: City[] = [];
  selectedCityId: string | null = null;
  searchQuery = new FormControl('');
  searchResults: DentalOffice[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCities();

    // Debounced search to avoid too many API calls
    this.searchQuery.valueChanges
      .pipe(
        debounceTime(300),
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

  searchDentalOffices(query: string) {
    if (!query.trim()) {
      return [];
    }

    this.isLoading = true;
    const params: any = { query };
    if (this.selectedCityId) params.cityId = this.selectedCityId;

    return this.http.get<{ content: DentalOffice[] }>(this.apiUrl + '/dental-offices/search', { params })
      .pipe(
        switchMap(response => [response.content])
      );
  }

  onCityChange(event: Event) {
    const cityId = event.target as HTMLSelectElement;
    this.selectedCityId = cityId.value;
    this.searchDentalOffices(this.searchQuery.value!);
  }

}
