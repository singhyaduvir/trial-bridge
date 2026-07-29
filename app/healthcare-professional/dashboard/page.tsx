import PageShell from '@/components/layout/PageShell';
import HealthcareProfessionalDashboard from '@/components/HealthcareProfessionalDashboard';
import RequireRole from '@/components/RequireRole';

export default function HealthcareProfessionalDashboardPage() {
  return (
    <RequireRole requiredRole="healthcare-professional">
      <PageShell fullWidth>
        <HealthcareProfessionalDashboard />
      </PageShell>
    </RequireRole>
  );
}
