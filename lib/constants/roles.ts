export const ROLES = {
    PATIENT: 'patient',
    HEALTHCARE_PROFESSIONAL: 'healthcare-professional',
    INVESTIGATOR: 'investigator',
  } as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function getDashboardRouteForRole(role?: Role | string | null): string {
  switch (role) {
    case ROLES.HEALTHCARE_PROFESSIONAL:
      return '/healthcare-professional/dashboard';
    case ROLES.INVESTIGATOR:
      return '/investigator/dashboard';
    case ROLES.PATIENT:
    default:
      return '/patient/dashboard';
  }
}