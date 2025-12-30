import Header from '@/components/Header';
import Hero from '@/components/Hero';

export default function Home() {
  return (
    /* The bg-white ensures the clean, professional look from your design */
    <main className="min-h-screen bg-white">
      {/* This container centers your content and provides the horizontal 
        spacing seen in the TrialBridge screenshot. 
      */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Header />
        <Hero />
      </div>
    </main>
  );
}