import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router) {

      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }

    onLogin() {
      if (this.loginForm.valid) {
        this.authService.login(this.loginForm.value).subscribe({
          next: (response) => {
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
    
            const userRoles = response.user?.roles?.map((role: any) => role.name) || [];
    
            if (userRoles[0] === 'ROLE_DENTIST') {
              console.log('Redirecting to dentist dashboard...');
              this.router.navigate(['/dentist']);
            } else if (userRoles[0] === 'ROLE_PATIENT' || userRoles[0] === 'ROLE_ADMIN') {
              console.log('Redirecting to home...');
              this.router.navigate(['/home']);
            } else {
              console.warn('Unknown role detected. Redirecting to home.');
              this.router.navigate(['/home']);
            }
          },
          error: (err) => {
            console.error('Login failed', err);
          }
        });
      }
    }
    

}
