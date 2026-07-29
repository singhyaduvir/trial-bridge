// app/investigator/dashboard/page.tsx
import PageShell from '@/components/layout/PageShell';
import InvestigatorDashboard from '@/components/InvestigatorDashboard';

export default function InvestigatorDashboardPage() {
  return (
    <PageShell fullWidth>
      <InvestigatorDashboard />
    </PageShell>
  );
}