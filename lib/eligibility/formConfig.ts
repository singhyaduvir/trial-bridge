import type { CategoryId, EligibilityFormData } from './types';
import {
  BIOMARKER_OPTIONS,
  DIAGNOSIS_OPTIONS,
  DIAGNOSTIC_TEST_OPTIONS,
  MUTATION_OPTIONS,
  US_STATE_OPTIONS,
} from './fieldOptions';

export type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: readonly string[] | string[];
  step?: string;
  min?: number;
  max?: number;
  helpText?: string;
  /** When select value equals this, show a companion text field */
  otherOption?: string;
  otherFieldName?: string;
  otherFieldLabel?: string;
  otherPlaceholder?: string;
};

export const ELIGIBILITY_CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: 'demographics', label: 'Demographics' },
  { id: 'diagnosis', label: 'Diagnosis & Disease' },
  { id: 'treatments', label: 'Prior Trial Participation' },
  { id: 'laboratory', label: 'Laboratory Values' },
  { id: 'functional', label: 'Functional Status' },
  { id: 'genetic', label: 'Genetic & Biomarkers' },
  { id: 'reproductive', label: 'Reproductive Health' },
];

export const ELIGIBILITY_FORM_FIELDS: Record<CategoryId, FormField[]> = {
  demographics: [
    {
      name: 'age',
      label: 'Age (years)',
      type: 'number',
      placeholder: 'e.g. 54',
      required: true,
      min: 18,
      max: 120,
      step: '1',
      helpText: 'Enter whole years only (18–120). Use your age on the date of screening.',
    },
    {
      name: 'patientType',
      label: 'Patient type',
      type: 'select',
      options: ['Active patient', 'In remission', 'Healthy volunteer', 'Other'],
      required: true,
      otherOption: 'Other',
      otherFieldName: 'patientTypeOther',
      otherFieldLabel: 'Please describe your patient type',
      otherPlaceholder: 'e.g. Breast cancer survivor currently monitoring treatment',
      helpText: 'Choose the option that best matches your current trial participation status.',
    },
    { name: 'sexAtBirth', label: 'Sex at Birth', type: 'select', options: ['Male', 'Female'], required: true },
    { name: 'pregnant', label: 'Are you currently pregnant?', type: 'radio', options: ['Yes', 'No', 'N/A'], required: true },
    { name: 'breastfeeding', label: 'Are you currently breastfeeding?', type: 'radio', options: ['Yes', 'No', 'N/A'], required: true },
    {
      name: 'locationCity',
      label: 'City',
      type: 'text',
      placeholder: 'e.g. Boston',
      required: true,
      helpText: 'City name only — no state or ZIP in this field.',
    },
    {
      name: 'locationState',
      label: 'State / Region',
      type: 'select',
      options: [...US_STATE_OPTIONS],
      required: true,
      helpText: 'Two-letter US state, DC, or choose if outside the US.',
    },
  ],
  diagnosis: [
    {
      name: 'diagnosis',
      label: 'Confirmed Diagnosis',
      type: 'select',
      options: [...DIAGNOSIS_OPTIONS],
      required: true,
      otherOption: 'Other (not listed)',
      otherFieldName: 'diagnosisOther',
      otherFieldLabel: 'Specify your diagnosis',
      otherPlaceholder: 'e.g. Stage IV cholangiocarcinoma',
      helpText: 'Choose the condition closest to your confirmed diagnosis.',
    },
    {
      name: 'biomarkerStatus',
      label: 'Biomarker Status',
      type: 'multiselect',
      options: [...BIOMARKER_OPTIONS],
      helpText: 'Select all that apply from your most recent molecular or pathology report.',
    },
  ],
  treatments: [
    {
      name: 'otherTrials',
      label: 'Have you participated in other trials in the last 6 months?',
      type: 'radio',
      options: ['Yes', 'No'],
    },
  ],
  laboratory: [
    {
      name: 'hemoglobin',
      label: 'Hemoglobin (g/dL)',
      type: 'number',
      placeholder: '12.5',
      step: '0.1',
      min: 4,
      max: 25,
      helpText: 'Decimal allowed (one place). Typical adult range ~12–17 g/dL.',
    },
    {
      name: 'anc',
      label: 'Absolute Neutrophil Count (cells/µL)',
      type: 'number',
      placeholder: '1500',
      step: '1',
      min: 0,
      max: 50000,
      helpText: 'Whole number from your CBC — e.g. 1500 (not 1.5).',
    },
    {
      name: 'platelets',
      label: 'Platelet Count (cells/µL)',
      type: 'number',
      placeholder: '150000',
      step: '1',
      min: 0,
      max: 2000000,
      helpText: 'Whole number — e.g. 150000 (not 150).',
    },
    {
      name: 'bilirubin',
      label: 'Total Bilirubin (mg/dL)',
      type: 'number',
      placeholder: '1.0',
      step: '0.1',
      min: 0,
      max: 30,
      helpText: 'Decimal allowed (one place), e.g. 0.8 or 1.2.',
    },
    {
      name: 'creatinine',
      label: 'Serum Creatinine (mg/dL)',
      type: 'number',
      placeholder: '1.0',
      step: '0.1',
      min: 0,
      max: 20,
      helpText: 'Decimal allowed (one place).',
    },
    {
      name: 'egfr',
      label: 'eGFR (mL/min/1.73m²)',
      type: 'number',
      placeholder: '90',
      step: '1',
      min: 0,
      max: 200,
      helpText: 'Whole number — e.g. 90. Leave blank if unknown.',
    },
  ],
  functional: [
    {
      name: 'ecogScore',
      label: 'ECOG Performance Status',
      type: 'select',
      options: [
        '0 - Fully active',
        '1 - Light work only',
        '2 - Ambulatory, no work',
        '3 - Limited self-care',
        '4 - Completely disabled',
      ],
    },
  ],
  genetic: [
    {
      name: 'mutations',
      label: 'Specific Mutations or Biomarkers',
      type: 'multiselect',
      options: [...MUTATION_OPTIONS],
      helpText: 'Select all identified on genomic or pathology testing.',
    },
    {
      name: 'diagnosticTest',
      label: 'Companion Diagnostic Test',
      type: 'select',
      options: [...DIAGNOSTIC_TEST_OPTIONS],
      otherOption: 'Other (specify below)',
      otherFieldName: 'diagnosticTestOther',
      otherFieldLabel: 'Test name and result',
      otherPlaceholder: 'e.g. FoundationOne CDx — EGFR exon 19 deletion detected',
      helpText: 'Choose the primary companion or genomic test performed, if any.',
    },
  ],
  reproductive: [
    {
      name: 'pregnancyTest',
      label: 'Recent Pregnancy Test Result',
      type: 'select',
      options: ['Negative', 'Positive', 'Not Performed', 'N/A'],
    },
  ],
};

function isEmpty(value?: string): boolean {
  return !value || value.trim() === '';
}

export function validateRequiredFields(form: EligibilityFormData): string[] {
  const errors: string[] = [];
  for (const category of ELIGIBILITY_CATEGORIES) {
    const fields = ELIGIBILITY_FORM_FIELDS[category.id];
    const section = form[category.id] ?? {};
    for (const field of fields) {
      if (field.required) {
        const value = section[field.name];
        if (isEmpty(value)) {
          errors.push(`${field.label} is required`);
          continue;
        }
      }

      if (field.otherOption && field.otherFieldName && section[field.name] === field.otherOption) {
        if (isEmpty(section[field.otherFieldName])) {
          errors.push(`${field.otherFieldLabel ?? field.otherFieldName} is required`);
        }
      }

      if (field.name === 'age' && section.age) {
        const age = Number(section.age);
        if (!Number.isInteger(age) || age < 18 || age > 120) {
          errors.push('Age must be a whole number between 18 and 120');
        }
      }
    }
  }
  return errors;
}
