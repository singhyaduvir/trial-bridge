import type { EligibilityFormData, PatientEligibilityProfile } from './types';

function parseNumber(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function field(form: EligibilityFormData, category: keyof EligibilityFormData, name: string): string | undefined {
  const v = form[category]?.[name];
  return v && v.trim() !== '' ? v.trim() : undefined;
}

function resolveSelectWithOther(
  form: EligibilityFormData,
  category: keyof EligibilityFormData,
  selectName: string,
  otherName: string,
  otherValue: string,
): string | undefined {
  const selected = field(form, category, selectName);
  if (!selected) return undefined;
  if (selected === otherValue) {
    return field(form, category, otherName) ?? selected;
  }
  return selected;
}

function resolveLocation(form: EligibilityFormData): string | undefined {
  const legacy = field(form, 'demographics', 'location');
  if (legacy) return legacy;

  const city = field(form, 'demographics', 'locationCity');
  const state = field(form, 'demographics', 'locationState');
  if (city && state) return `${city}, ${state}`;
  return city ?? state;
}

export function formDataToProfile(form: EligibilityFormData): PatientEligibilityProfile {
  return {
    demographics: {
      age: parseNumber(field(form, 'demographics', 'age')),
      sexAtBirth: field(form, 'demographics', 'sexAtBirth'),
      pregnant: field(form, 'demographics', 'pregnant'),
      breastfeeding: field(form, 'demographics', 'breastfeeding'),
      location: resolveLocation(form),
    },
    diagnosis: {
      diagnosis: resolveSelectWithOther(
        form,
        'diagnosis',
        'diagnosis',
        'diagnosisOther',
        'Other (not listed)',
      ),
      biomarkerStatus: field(form, 'diagnosis', 'biomarkerStatus'),
    },
    treatments: {
      otherTrials: field(form, 'treatments', 'otherTrials'),
    },
    laboratory: {
      hemoglobin: parseNumber(field(form, 'laboratory', 'hemoglobin')),
      anc: parseNumber(field(form, 'laboratory', 'anc')),
      platelets: parseNumber(field(form, 'laboratory', 'platelets')),
      bilirubin: parseNumber(field(form, 'laboratory', 'bilirubin')),
      creatinine: parseNumber(field(form, 'laboratory', 'creatinine')),
      egfr: parseNumber(field(form, 'laboratory', 'egfr')),
    },
    functional: {
      ecogScore: field(form, 'functional', 'ecogScore'),
    },
    genetic: {
      mutations: field(form, 'genetic', 'mutations'),
      diagnosticTest: resolveSelectWithOther(
        form,
        'genetic',
        'diagnosticTest',
        'diagnosticTestOther',
        'Other (specify below)',
      ),
    },
    reproductive: {
      pregnancyTest: field(form, 'reproductive', 'pregnancyTest'),
    },
  };
}

export function profileToSearchParams(profile: PatientEligibilityProfile): {
  condition?: string;
  location?: string;
} {
  return {
    condition: profile.diagnosis.diagnosis,
    location: profile.demographics.location,
  };
}
