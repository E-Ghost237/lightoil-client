import { CanMatchFn } from '@angular/router';

export const superAdminRouteMatchGuard: CanMatchFn = () => {
  const token = parseJson(localStorage.getItem('token'));
  const userDetails = parseJson(localStorage.getItem('user_details'));

  if (!token?.access_token || !userDetails?.user) {
    return false;
  }

  return isSuperAdminUser(userDetails);
};

function parseJson(raw: string | null): any {
  try {
    return JSON.parse(raw || 'null');
  } catch {
    return null;
  }
}

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
