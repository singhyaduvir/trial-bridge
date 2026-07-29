import { validateRequiredFields } from './formConfig';
import type { EligibilityFormData } from './types';

export const ELIGIBILITY_STORAGE_KEY = 'trial-bridge-eligibility-profile';

export function saveEligibilityFormData(data: EligibilityFormData): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ELIGIBILITY_STORAGE_KEY, JSON.stringify(data));
}

export function loadEligibilityFormData(): EligibilityFormData | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ELIGIBILITY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EligibilityFormData;
  } catch {
    return null;
  }
}

export function clearEligibilityFormData(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ELIGIBILITY_STORAGE_KEY);
}

export function hasCompletedEligibilityForm(): boolean {
  const data = loadEligibilityFormData();
  if (!data) return false;
  return validateRequiredFields(data).length === 0;
}
