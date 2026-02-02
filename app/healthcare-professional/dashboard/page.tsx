import Header from '@/components/Header';
import HealthcareProfessionalDashboard from '@/components/HealthcareProfessionalDashboard';

export default function HealthcareProfessionalDashboardPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Header />
      </div>
      <HealthcareProfessionalDashboard />
    </main>
  );
}