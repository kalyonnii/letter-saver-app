import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'letter-saver-app';
  constructor(private authService:AuthService){}

  ngOnInit(): void {
    this.authService.checkAuthentication().subscribe();
    console.log('Current User:', this.authService.getCurrentUser());
  }

}
