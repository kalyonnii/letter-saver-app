// src/app/services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";

// User interface for type safety
export interface User {
  id: string;
  name: string;
  email: string;
  accessToken?: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  // BehaviorSubject to track current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Observable for components to subscribe to user state
  currentUser$ = this.currentUserSubject.asObservable();

  // Base API URL from environment
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    // Check if user is already authenticated on service initialization
    this.checkAuthentication();
  }

  // Login method (redirects to Google OAuth)
  login(): void {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  // Logout method
  logout(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user/logout`).pipe(
      tap(() => {
        console.log("api logout calling")
        // Clear user on successful logout
        this.currentUserSubject.next(null);
        // Redirect to login page
        window.location.href = '/login';
      }),
      catchError(this.handleError<any>('logout'))
    );
  }
  // logout(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/api/user/logout`);
  // }

  // Check authentication status
  checkAuthentication(): void {
    this.http
      .get<User>(`${this.apiUrl}/api/user`)
      .pipe(
        tap(user => {
          if (user) {
            this.currentUserSubject.next(user);
          }
        }),
        catchError(() => {
          this.currentUserSubject.next(null);
          return of(null);
        })
      )
      .subscribe();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Refresh user token (if implemented on backend)
  refreshToken(): Observable<User | null> {
    return this.http.post<User>(`${this.apiUrl}/auth/refresh-token`, {}).pipe(
      tap(user => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      }),
      catchError(this.handleError<User | null>("refreshToken"))
    );
  }

  // Error handling method
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      // Log error to console
      console.error(`${operation} failed: ${error.message}`);

      // Optionally dispatch to error tracking service

      // Return a safe result
      return of(result as T);
    };
  }

  // Get authentication status as observable
  getAuthStatus(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }
}
