import type { MedicalDocumentRecord } from './types';

export async function listMedicalDocuments(patientId?: string): Promise<MedicalDocumentRecord[]> {
  const url = new URL('/api/documents', location.href);
  if (patientId) {
    url.searchParams.set('patientId', patientId);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load medical documents.');
  }

  return response.json();
}

export async function saveMedicalDocument(
  record: Omit<MedicalDocumentRecord, 'id' | 'uploadedAt' | 'downloadUrl'>,
  file: File,
  patientId?: string,
): Promise<MedicalDocumentRecord> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('typeId', record.typeId);
  formData.append('label', record.label);
  formData.append('fileName', record.fileName);
  formData.append('mimeType', record.mimeType);
  formData.append('sizeBytes', String(record.sizeBytes));
  if (patientId) {
    formData.append('patientId', patientId);
  }

  const response = await fetch('/api/documents', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to upload document.');
  }

  return response.json();
}

export async function deleteMedicalDocument(id: string, patientId?: string): Promise<void> {
  const url = new URL(`/api/documents/${id}`, location.href);
  if (patientId) {
    url.searchParams.set('patientId', patientId);
  }

  const response = await fetch(url.toString(), {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to delete document.');
  }
}
