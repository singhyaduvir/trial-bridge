export const ROLES = {
    PATIENT: 'patient',
    HEALTHCARE_PROFESSIONAL: 'healthcare-professional',
    INVESTIGATOR: 'investigator',
  } as const;
  
export type Role = (typeof ROLES)[keyof typeof ROLES];