import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    authService.clearSession();
    return throwError(() => new Error('Phiên đăng nhập đã hết hạn'));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res) => {
        const newToken = res.data?.accessToken;
        if (newToken) {
          refreshTokenSubject.next(newToken);
          return next(addToken(req, newToken));
        }
        authService.clearSession();
        return throwError(() => new Error('Không thể làm mới token'));
      }),
      catchError((err) => {
        authService.clearSession();
        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token)))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const cloned = token ? addToken(req, token) : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/api/v1/auth/login')
        || req.url.includes('/api/v1/auth/register')
        || req.url.includes('/api/v1/auth/refresh-token')
        || req.url.includes('/api/v1/auth/verify-2fa');

      if (error.status === 401 && !isAuthEndpoint) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};
