export type MedicalDocumentTypeId =
  | 'blood_test'
  | 'mri'
  | 'ct_scan'
  | 'x_ray'
  | 'ultrasound'
  | 'pathology'
  | 'genetic_test'
  | 'other';

export type MedicalDocumentRecord = {
  id: string;
  patientId?: string;
  typeId: MedicalDocumentTypeId;
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  downloadUrl?: string;
};
