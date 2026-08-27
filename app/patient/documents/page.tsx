import { Suspense } from 'react';
import PageShell from '@/components/layout/PageShell';
import PatientDocumentsUpload from '@/components/PatientDocumentsUpload';

export default function PatientDocumentsPage() {
  return (
    <PageShell fullWidth>
      <Suspense fallback={<div className="min-h-screen bg-gemini-canvas" />}>
        <PatientDocumentsUpload />
      </Suspense>
    </PageShell>
  );
}
