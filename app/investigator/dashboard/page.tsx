// app/investigator/dashboard/page.tsx
import PageShell from '@/components/layout/PageShell';
import InvestigatorDashboard from '@/components/InvestigatorDashboard';
import RequireRole from '@/components/RequireRole';

export default function InvestigatorDashboardPage() {
  return (
    <RequireRole requiredRole="investigator">
      <PageShell fullWidth>
        <InvestigatorDashboard />
      </PageShell>
    </RequireRole>
  );
}