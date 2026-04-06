import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { username, password, remember } = this.loginForm.value;

    this.http.post<any>('http://localhost:8000/api/login/', { username, password }).subscribe({
      next: (response) => {
        console.log('Login successful', response);

        // guardar token
        if (remember) {
          localStorage.setItem('access', response.access);
        } else {
          sessionStorage.setItem('access', response.access);
        }

        this.router.navigate(['/home']);
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}