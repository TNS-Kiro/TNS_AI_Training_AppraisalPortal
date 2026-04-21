import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

/** Returns the default home route for a given set of roles (priority order). */
function getHomeRoute(roles: string[]): string {
  if (roles.includes('ADMIN'))    return '/admin/users';
  if (roles.includes('HR'))       return '/hr/cycles';
  if (roles.includes('MANAGER'))  return '/manager';
  if (roles.includes('EMPLOYEE')) return '/employee';
  return '/login';
}

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;

  // No role restriction on this route — allow through
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => user ? of(user) : authService.resolveSessionUser()),
    map(user => {
      if (!user) {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }

      const hasRole = requiredRoles.some(role => user.roles.includes(role));
      if (hasRole) {
        return true;
      }

      // Authenticated but wrong role — redirect to their own home
      router.navigate([getHomeRoute(user.roles)]);
      return false;
    })
  );
};
