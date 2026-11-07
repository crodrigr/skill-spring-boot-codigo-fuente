import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

/** Agrega `Authorization: Bearer` y reacciona a 401 (sesión) y 403 (rol). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService), toast = inject(ToastService), router = inject(Router);
  const isLogin = req.url.endsWith('/auth/login');
  const token = auth.token();
  if (token && !isLogin && !req.url.endsWith('/internal/health')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req).pipe(catchError(err => {
    if (err.status === 401 && !isLogin) { auth.logout(false); toast.err('Tu sesión expiró. Inicia sesión de nuevo.'); router.navigate(['/login']); }
    if (err.status === 403) toast.err('Acceso denegado: tu rol no permite esta acción.');
    return throwError(() => err);
  }));
};

export const authGuard: CanActivateFn = () => {
  const a = inject(AuthService);
  return a.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};
export const adminGuard: CanActivateFn = () =>
  inject(AuthService).isAdmin() ? true : inject(Router).createUrlTree(['/acceso-denegado']);
