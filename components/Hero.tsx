// components/Hero.tsx
import Link from 'next/link';
import HeroGallery from './HeroGallery';


const Hero = () => {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between py-12 md:py-20 gap-8">
      {/* Left Side: Text Content */}
      <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
        <h1 className="gemini-heading-hero gemini-gradient-text">
          Connecting you to tomorrow&apos;s medicine
        </h1>
        <p className="text-lg text-gemini-muted max-w-lg">
          TrialBridge matches patients to clinical trials tailored to their condition — unlocking personalized treatment options.
        </p>
        <Link 
          href="/login?mode=signup" 
          className="gemini-btn gemini-btn-pill"
        >
          GET STARTED
        </Link>
      </div>

      {/* Right Side: The Mini Zigzag Gallery */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <HeroGallery />
      </div>
      
    </section>
    
  );
};

export default Hero;
