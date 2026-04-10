import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // In dev bypass mode, never redirect to login on API errors
      if (!environment.devBypassAuth && error.status === 401 && !req.url.includes('/auth/me')) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
