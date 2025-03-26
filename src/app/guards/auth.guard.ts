// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
  //   return this.authService.currentUser$.pipe(
  //     map(user => {
  //       if (user) {
  //         console.log("user",user)
  //         return true;
  //       } else {
  //         this.router.navigate(['/login']);
  //         return false;
  //       }
  //     })
  //   );
  // }
    return this.authService.getAuthStatus().pipe(
      tap(isAuthenticated => {
        console.log('AuthGuard - isAuthenticated:', isAuthenticated);
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
