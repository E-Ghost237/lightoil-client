import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const superAdminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const userDetails = JSON.parse(localStorage.getItem('user_details') || 'null');
    const roleType = userDetails?.role_type;

    if (!token?.access_token || !userDetails?.user) {
        return router.parseUrl('/auth/login');
    }

    if (roleType !== 'Super Admin') {
        return router.parseUrl('/auth/access');
    }

    return true;
};
