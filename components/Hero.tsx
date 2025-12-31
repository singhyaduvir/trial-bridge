// components/Hero.tsx
import Link from 'next/link';
import HeroGallery from './HeroGallery'; // Import the new component

const Hero = () => {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between py-12 md:py-20 gap-8">
      {/* Left Side: Text Content */}
      <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-900 leading-tight">
          Connecting you to tomorrow's medicine
        </h1>
        <p className="text-lg text-gray-600 max-w-lg">
          TrialBridge matches patients to clinical trials tailored to their condition — unlocking personalized treatment options.
        </p>
        <Link 
          href="/get-started" 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
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