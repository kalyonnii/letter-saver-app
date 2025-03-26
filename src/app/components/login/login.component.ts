// components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // this.authService.currentUser$.subscribe(user => {
    //   if (user) {
    //     this.router.navigate(['/dashboard']);
    //   }
    // });
    this.authService.getAuthStatus().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        console.log('Redirecting to dashboard');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onGoogleLogin() {
    this.authService.login();
  }
}
