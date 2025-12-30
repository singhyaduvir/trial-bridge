// components/Hero.tsx
import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between py-16 md:py-24">
      <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-blue-900 leading-tight">
          Connecting you to tomorrow's medicine
        </h1>
        <p className="text-lg text-gray-600 max-w-lg">
          TrialBridge matches patients to clinical trials tailored to their condition — unlocking personalized treatment options.
        </p>
        <Link href="/get-started" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg">
          GET STARTED
        </Link>
      </div>
      <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
        {/* NOTE: You will need to add the illustration from the design 
          into your public folder (e.g., /public/doctor-illustration.png) 
          and update the src below.
        */}
        <div className="relative w-full max-w-lg h-[400px]">
            <Image 
                src="/doctor-illustration.png" // Replace with your image path
                alt="Doctor pointing to a heart checkmark icon"
                fill
                className="object-contain"
                priority
            />
        </div>
      </div>
    </section>
  );
};

export default Hero;