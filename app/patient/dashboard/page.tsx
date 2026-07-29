import PageShell from '@/components/layout/PageShell';
import PatientDashboard from '@/components/PatientDashboard';
import RequireRole from '@/components/RequireRole';

export default function PatientDashboardPage() {
  return (
    <RequireRole requiredRole="patient">
      <PageShell fullWidth>
        <PatientDashboard />
      </PageShell>
    </RequireRole>
  );
}
