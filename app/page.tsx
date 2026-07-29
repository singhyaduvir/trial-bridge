import Hero from '@/components/Hero';
import PageShell from '@/components/layout/PageShell';

export default function Home() {
  return (
    <PageShell fullWidth={false}>
      <Hero />
    </PageShell>
  );
}