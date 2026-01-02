import Header from '@/components/Header';
import TrialEligibilityForm from '@/components/TrialEligibilityForm';

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Header />
      </div>
      <TrialEligibilityForm />
    </main>
  );
}