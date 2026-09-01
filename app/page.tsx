import Hero from '@/components/Hero';
import PageShell from '@/components/layout/PageShell';
import TrialJourneyWrapper from '@/components/TrialJourneyWrapper';

export default function Home() {
  return (
    <>
      <PageShell fullWidth={false}>
        <Hero />
      </PageShell>

      {/* Full-bleed trial journey placed below the hero. */}
      <div className="w-full">
        <TrialJourneyWrapper />
      </div>
    </>
  );
}