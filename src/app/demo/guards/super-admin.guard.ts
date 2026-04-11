import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const superAdminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const userDetails = JSON.parse(localStorage.getItem('user_details') || 'null');

    if (!token?.access_token || !userDetails?.user) {
        return router.parseUrl('/auth/login');
    }

    if (!isSuperAdminUser(userDetails)) {
        return router.parseUrl('/auth/access');
    }

    return true;
};

function isSuperAdminUser(userDetails: any): boolean {
    const roleType = String(userDetails?.role_type ?? '').trim().toLowerCase();
    const userFlag = userDetails?.user?.is_platform_super_admin;
    const detailFlag = userDetails?.is_platform_super_admin;

    const isPlatformSuperAdmin =
        userFlag === true
        || detailFlag === true
        || userFlag === 1
        || detailFlag === 1
        || String(userFlag ?? '').trim() === '1'
        || String(detailFlag ?? '').trim() === '1'
        || String(userFlag ?? '').trim().toLowerCase() === 'true'
        || String(detailFlag ?? '').trim().toLowerCase() === 'true';

    if (isPlatformSuperAdmin) {
        return true;
    }

    return roleType === 'super admin' || roleType === 'super administrateur';
}
