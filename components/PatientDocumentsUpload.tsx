'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MEDICAL_DOCUMENT_CATEGORIES } from '@/lib/documents/categories';
import {
  deleteMedicalDocument,
  listMedicalDocuments,
  saveMedicalDocument,
} from '@/lib/documents/storage';
import type { MedicalDocumentRecord, MedicalDocumentTypeId } from '@/lib/documents/types';

export default function PatientDocumentsUpload() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<MedicalDocumentRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploadTypeId, setUploadTypeId] = useState<MedicalDocumentTypeId>('blood_test');
  const [label, setLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paramId = searchParams.get('patientId');
    const storedId = window.localStorage.getItem('trialBridgePatientId');
    const idToUse = paramId ?? storedId ?? crypto.randomUUID();

    window.localStorage.setItem('trialBridgePatientId', idToUse);
    setPatientId(idToUse);
  }, [searchParams]);

  const refreshDocuments = useCallback(async () => {
    setError(null);
    try {
      const docs = await listMedicalDocuments(patientId ?? undefined);
      setDocuments(docs);
    } catch {
      setError('Unable to load document list.');
    } finally {
      setLoaded(true);
    }
  }, [patientId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const documentsByType = useMemo(() => {
    const grouped = new Map<MedicalDocumentTypeId, MedicalDocumentRecord[]>();
    for (const category of MEDICAL_DOCUMENT_CATEGORIES) {
      grouped.set(category.id, []);
    }
    for (const doc of documents) {
      grouped.get(doc.typeId)?.push(doc);
    }
    return grouped;
  }, [documents]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError('Choose a file to upload.');
      return;
    }

    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError('Add a label so you can find this document later.');
      return;
    }

    try {
      setUploading(true);
      await saveMedicalDocument(
        {
          typeId: uploadTypeId,
          label: trimmedLabel,
          fileName: selectedFile.name,
          mimeType: selectedFile.type || 'application/octet-stream',
          sizeBytes: selectedFile.size,
        },
        selectedFile,
        patientId ?? undefined,
      );
      setLabel('');
      setSelectedFile(null);
      const fileInput = document.getElementById('document-file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      await refreshDocuments();
    } catch {
      setError('Could not save the document. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this document from your records?')) return;

    try {
      await deleteMedicalDocument(id, patientId ?? undefined);
      await refreshDocuments();
    } catch {
      setError('Could not delete the document.');
    }
  };

  return (
    <div className="min-h-screen bg-gemini-canvas">
      <div className="bg-gemini-surface border-b border-gemini-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            href="/patient/dashboard"
            className="text-sm font-medium text-gemini-accent hover:text-gemini-accent"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-3xl gemini-heading-lg text-gemini-primary">Medical documents</h1>
          <p className="mt-2 text-gemini-muted max-w-2xl">
            Upload records by category and add labels (e.g. &quot;CBC Jan 2025&quot; or
            &quot;Brain MRI pre-treatment&quot;) so you and your care team can find them quickly.
          </p>
          {patientId && (
            <p className="mt-2 text-xs text-gemini-muted max-w-2xl">
              Current patient identifier: <span className="font-medium">{patientId}</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        <section className="gemini-card p-6">
          <h2 className="text-lg font-semibold text-gemini-primary">Upload a document</h2>
          <form onSubmit={handleUpload} className="mt-6 space-y-5">
            <div>
              <label htmlFor="document-type" className="block text-sm font-medium text-gemini-primary mb-2">
                Document type
              </label>
              <select
                id="document-type"
                value={uploadTypeId}
                onChange={(e) => setUploadTypeId(e.target.value as MedicalDocumentTypeId)}
                className="w-full max-w-md px-4 py-2 border border-gemini-border rounded-xl text-gemini-primary bg-gemini-surface focus:ring-2 focus:ring-gemini-accent"
              >
                {MEDICAL_DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="document-label" className="block text-sm font-medium text-gemini-primary mb-2">
                Label <span className="text-gemini-error-text">*</span>
              </label>
              <input
                id="document-label"
                type="text"
                placeholder="e.g. Metabolic panel — March 2025"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full max-w-lg px-4 py-2 border border-gemini-border rounded-xl text-gemini-primary focus:ring-2 focus:ring-gemini-accent"
              />
            </div>

            <div>
              <label htmlFor="document-file-input" className="block text-sm font-medium text-gemini-primary mb-2">
                File
              </label>
              <input
                id="document-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="block w-full max-w-lg text-sm text-gemini-primary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gemini-accent-subtle file:text-gemini-accent file:font-medium hover:file:bg-gemini-accent-subtle"
              />
              {selectedFile && (
                <p className="mt-2 text-xs text-gemini-muted">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-gemini-error-text" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 gemini-btn rounded-xl text-sm font-medium hover:bg-gemini-surface-hover transition-colors duration-200 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload document'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gemini-primary mb-4">Your documents by type</h2>
          {!loaded ? (
            <p className="text-gemini-muted text-sm">Loading…</p>
          ) : (
            <div className="space-y-6">
              {MEDICAL_DOCUMENT_CATEGORIES.map((category) => {
                const items = documentsByType.get(category.id) ?? [];
                return (
                  <div
                    key={category.id}
                    className="gemini-card overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-gemini-border bg-gemini-canvas">
                      <h3 className="font-semibold text-gemini-primary">{category.label}</h3>
                      <p className="text-sm text-gemini-muted mt-0.5">{category.description}</p>
                    </div>
                    {items.length === 0 ? (
                      <p className="px-6 py-5 text-sm text-gemini-muted">No documents in this category yet.</p>
                    ) : (
                      <ul className="divide-y divide-gemini-border">
                        {items.map((doc) => (
                          <li
                            key={doc.id}
                            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                          >
                            <div>
                              <p className="font-medium text-gemini-primary">{doc.label}</p>
                              <p className="text-sm text-gemini-muted mt-0.5">
                                {doc.fileName} · {formatFileSize(doc.sizeBytes)} ·{' '}
                                {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <a
                                href={doc.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 text-sm font-medium text-gemini-accent border border-gemini-border rounded-xl hover:bg-gemini-accent-subtle"
                              >
                                Download
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDelete(doc.id)}
                                className="px-3 py-1.5 text-sm font-medium text-gemini-error-text border border-gemini-border rounded-xl hover:bg-gemini-error-bg"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
