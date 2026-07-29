import PageShell from '@/components/layout/PageShell';
import PatientDocumentsUpload from '@/components/PatientDocumentsUpload';

export default function PatientDocumentsPage() {
  return (
    <PageShell fullWidth>
      <PatientDocumentsUpload />
    </PageShell>
  );
}
