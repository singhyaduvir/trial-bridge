import type { Role } from '@/lib/constants/roles';

const USER_ROLE_KEY = 'trialBridgeUserRole';
const USER_EMAIL_KEY = 'trialBridgeUserEmail';
const PATIENT_TYPE_KEY = 'trialBridgePatientType';

export function saveUserRole(role: Role): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_ROLE_KEY, role);
}

export function loadUserRole(): Role | null {
  if (typeof window === 'undefined') return null;
  return (window.localStorage.getItem(USER_ROLE_KEY) as Role) ?? null;
}

export function saveUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_EMAIL_KEY, email);
}

export function loadUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(USER_EMAIL_KEY);
}

export function savePatientType(patientType: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PATIENT_TYPE_KEY, patientType);
}

export function loadPatientType(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PATIENT_TYPE_KEY);
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(USER_ROLE_KEY);
  window.localStorage.removeItem(USER_EMAIL_KEY);
  window.localStorage.removeItem(PATIENT_TYPE_KEY);
}
