import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  logout() {
    localStorage.removeItem('access');
    sessionStorage.removeItem('access');
    window.location.href = '/login';
  }
}
