import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'; // Quitamos FormGroup de aquí si usamos el tipo inferido
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router'; // Añadimos RouterLink para el enlace de "olvidé contraseña"
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // Asegúrate de que sea standalone
  imports: [ReactiveFormsModule, CommonModule, RouterLink], // Importamos RouterLink aquí
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = false;
  errorMessage = '';

  // Tipado fuerte inferido (mejor práctica en versiones recientes)
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Esto fuerza a que Bootstrap muestre los errores si el usuario da click sin escribir
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Usamos nonNullable si quieres evitar que los valores sean null, pero así está perfecto:
    const { username, password, remember } = this.loginForm.value;

    this.http.post<any>('http://localhost:8000/api/login/', { username, password }).subscribe({
      next: (response) => {
        // Manejo del token según el checkbox 'remember'
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('access', response.access);
        
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login error', err);
        this.errorMessage = 'Credenciales incorrectas o error de servidor';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}