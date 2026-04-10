import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { RoleName } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  if (environment.devBypassAuth) return true;

  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as RoleName[];

  if (!requiredRoles || requiredRoles.length === 0) return true;

  return authService.currentUser$.pipe(
    map(user => {
      if (!user) { router.navigate(['/login']); return false; }
      const hasRole = requiredRoles.some(role => user.roles.map(r => r.name).includes(role));
      if (!hasRole) { router.navigate(['/unauthorized']); return false; }
      return true;
    })
  );
};
