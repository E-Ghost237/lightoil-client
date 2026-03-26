import { CanMatchFn } from '@angular/router';

export const nonSuperAdminRouteMatchGuard: CanMatchFn = () => {
  const token = parseJson(localStorage.getItem('token'));
  const userDetails = parseJson(localStorage.getItem('user_details'));

  if (!token?.access_token || !userDetails?.user) {
    return false;
  }

  return String(userDetails?.role_type ?? '').trim() !== 'Super Admin';
};

function parseJson(raw: string | null): any {
  try {
    return JSON.parse(raw || 'null');
  } catch {
    return null;
  }
}
