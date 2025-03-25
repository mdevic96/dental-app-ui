import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css'
})
export class InfoComponent implements OnInit {

  @Input() office: any = null;
  @Input() dentists: any[] = [];
  @Input() services: any[] = [];
  @Output() close = new EventEmitter<void>();

  reviews: any[] = [];
  newReview = { rating: 5, comment: '' };
  isLoggedIn = false;

  userHasReviewed = false;
  currentUserId: number | null = null;

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUserId = this.authService.getUser().id;

    if (this.office?.id) {
      this.loadReviews();
    }
  }

  loadReviews() {
    this.http.get<any[]>(`${this.apiUrl}/reviews/dental-office/${this.office.id}`)
      .subscribe(reviews => {
        const currentUserId = this.currentUserId;

        const userReview = reviews.find(r => r.patient?.id === currentUserId);
        const otherReviews = reviews.filter(r => r.patient?.id !== currentUserId);

        this.reviews = userReview ? [userReview, ...otherReviews] : [...otherReviews];
        this.userHasReviewed = !!userReview;
      });
  }
  
  submitReview() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      dentalOfficeId: this.office.id,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    };

    this.http.post(`${this.apiUrl}/reviews`, payload, { headers }).subscribe(() => {
      this.newReview = { rating: 5, comment: '' };
      this.loadReviews();

      // Update displayed rating (recalculate average)
      const total = this.reviews.reduce((acc, r) => acc + r.rating, 0) + payload.rating;
      const count = this.reviews.length + 1;
      this.office.rating = Math.round((total / count) * 10) / 10;
    });
  }

  closeDialog() {
    this.close.emit();
  }
}
