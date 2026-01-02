import Header from '@/components/Header';
import TrialMatchingPage from '@/components/TrialsMatch';
import TrailsMatch from '@/components/TrialsMatch';

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Header />
      </div>
      <TrialMatchingPage />
    </main>
  );
}