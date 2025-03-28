// services/auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, ReplaySubject } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { environment } from "../../environments/environment";

// User interface for better type-checking
export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticated$ = new ReplaySubject<boolean>(1);
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    // Ensure the session is checked when service initializes
    this.checkAuthentication();
  }

  // Initiate Google Login
  login(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  // Logout and clear user session
  logout(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/user/logout`).pipe(
      tap(() => {
        console.log("Logging out user");
        this.currentUserSubject.next(null);
        window.location.href = "/login";
      }),
      catchError(err => {
        console.error("Logout error:", err);
        return of(null);
      })
    );
  }

  // Check if the user is authenticated (on app load)
  // checkAuthentication(): void {
  //   this.http
  //     .get<User>(`${this.apiUrl}/api/user`)
  //     .pipe(
  //       tap(user => {
  //         if (user) {
  //           console.log("Authenticated User:", user);
  //           this.currentUserSubject.next(user);
  //         } else {
  //           this.currentUserSubject.next(null);
  //         }
  //       }),
  //       catchError(() => {
  //         this.currentUserSubject.next(null);
  //         return of(null);
  //       })
  //     )
  //     .subscribe();
  // }


  checkAuthentication(): Observable<boolean> {
    return this.http
      .get<User>(`${this.apiUrl}/api/user`, { withCredentials: true })
      .pipe(
        map(user => {
          if (user) {
            console.log("Authenticated User:", user);
            this.currentUserSubject.next(user);
            return true; // User is authenticated
          } else {
            console.log("No user found");
            this.currentUserSubject.next(null);
            return false; // Not authenticated
          }
        }),
        catchError(err => {
          console.error("Error checking auth:", err);
          this.currentUserSubject.next(null);
          return of(false); // Return false on error
        })
      );
  }

  // Get the current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // // Return true if authenticated
  // isAuthenticated(): boolean {
  //   return !!this.getCurrentUser();
  // }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  // Return an observable for authentication status
  getAuthStatus(): Observable<boolean> {
    return this.currentUser$.pipe(
      tap(user => console.log("Auth status checked:", !!user)),
      map(user => !!user)
    );
  }
}

// // src/app/services/auth.service.ts
// import { Injectable } from "@angular/core";
// import { HttpClient } from "@angular/common/http";
// import { BehaviorSubject, Observable, of, throwError } from "rxjs";
// import { catchError, map, tap } from "rxjs/operators";
// import { environment } from "../../environments/environment";

// // User interface for type safety
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   accessToken?: string;
// }

// @Injectable({
//   providedIn: "root"
// })
// export class AuthService {
//   // BehaviorSubject to track current user state
//   private currentUserSubject = new BehaviorSubject<User | null>(null);

//   // Observable for components to subscribe to user state
//   currentUser$ = this.currentUserSubject.asObservable();

//   // Base API URL from environment
//   private apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) {
//     // Check if user is already authenticated on service initialization
//     this.checkAuthentication();
//   }

//   // Login method (redirects to Google OAuth)
//   login(): void {
//     // Redirect to backend Google OAuth endpoint
//     window.location.href = `${this.apiUrl}/auth/google`;
//   }

//   // Logout method
//   logout(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/api/user/logout`).pipe(
//       tap(() => {
//         console.log("api logout calling")
//         // Clear user on successful logout
//         this.currentUserSubject.next(null);
//         // Redirect to login page
//         window.location.href = '/login';
//       }),
//       catchError(this.handleError<any>('logout'))
//     );
//   }
//   // logout(): Observable<any> {
//   //   return this.http.get(`${this.apiUrl}/api/user/logout`);
//   // }

//   // Check authentication status
//   checkAuthentication(): void {
//     this.http
//       .get<User>(`${this.apiUrl}/api/user`)
//       .pipe(
//         tap(user => {
//           if (user) {
//             this.currentUserSubject.next(user);
//           }
//         }),
//         catchError(() => {
//           this.currentUserSubject.next(null);
//           return of(null);
//         })
//       )
//       .subscribe();
//   }

//   // Get current user
//   getCurrentUser(): User | null {
//     return this.currentUserSubject.value;
//   }

//   // Check if user is authenticated
//   isAuthenticated(): boolean {
//     return !!this.currentUserSubject.value;
//   }

//   // Refresh user token (if implemented on backend)
//   refreshToken(): Observable<User | null> {
//     return this.http.post<User>(`${this.apiUrl}/auth/refresh-token`, {}).pipe(
//       tap(user => {
//         if (user) {
//           this.currentUserSubject.next(user);
//         }
//       }),
//       catchError(this.handleError<User | null>("refreshToken"))
//     );
//   }

//   // Error handling method
//   private handleError<T>(operation = "operation", result?: T) {
//     return (error: any): Observable<T> => {
//       // Log error to console
//       console.error(`${operation} failed: ${error.message}`);

//       // Optionally dispatch to error tracking service

//       // Return a safe result
//       return of(result as T);
//     };
//   }

//   // Get authentication status as observable
//   getAuthStatus(): Observable<boolean> {
//     return this.currentUser$.pipe(map(user => !!user));
//   }
// }
