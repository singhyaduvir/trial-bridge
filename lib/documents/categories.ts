import type { MedicalDocumentTypeId } from './types';

export type MedicalDocumentCategory = {
  id: MedicalDocumentTypeId;
  label: string;
  description: string;
};

export const MEDICAL_DOCUMENT_CATEGORIES: MedicalDocumentCategory[] = [
  {
    id: 'blood_test',
    label: 'Blood tests',
    description: 'CBC, metabolic panels, tumor markers, and other lab results',
  },
  {
    id: 'mri',
    label: 'MRI',
    description: 'Magnetic resonance imaging reports and images',
  },
  {
    id: 'ct_scan',
    label: 'CT scans',
    description: 'Computed tomography reports and images',
  },
  {
    id: 'x_ray',
    label: 'X-rays',
    description: 'Chest, bone, and other radiograph reports',
  },
  {
    id: 'ultrasound',
    label: 'Ultrasound',
    description: 'Sonography and echocardiography reports',
  },
  {
    id: 'pathology',
    label: 'Pathology',
    description: 'Biopsy results, histology, and surgical pathology',
  },
  {
    id: 'genetic_test',
    label: 'Genetic tests',
    description: 'Germline or somatic sequencing and molecular reports',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Discharge summaries, letters, or uncategorized records',
  },
];

export function getDocumentCategory(id: MedicalDocumentTypeId) {
  return MEDICAL_DOCUMENT_CATEGORIES.find((c) => c.id === id);
}
