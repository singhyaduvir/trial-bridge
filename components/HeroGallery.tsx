// components/HeroGallery.tsx
import Image from 'next/image';

const HeroGallery = () => {
  const galleryItems = [
    { id: 1, src: '/AdobeStock_503835299-1-scaled.jpeg', caption: 'Personalized Matching' },
    { id: 2, src: '/shutterstock_1924512614.jpg', caption: 'Advanced Research' },
    { id: 3, src: '/patient-hospital.jpg', caption: 'Success Stories' },
  ];

  return (
    <div className="flex flex-col space-y-16 w-full max-w-4xl mx-auto p-4 md:p-8">
      {galleryItems.map((item, index) => (
        <div
          key={item.id}
          className={`
            relative group w-[80%] md:w-[70%] 
            animate-float group-hover:[animation-play-state:paused] 
            ${index % 2 !== 0 ? 'self-end' : 'self-start'}
          `}
        >
          <div 
            className={`
              absolute -top-10 left-0 z-20 
              transition-all duration-300 ease-out
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            `}
          >
            <span className="text-sm md:text-base font-medium text-gemini-primary bg-gemini-surface/95 px-4 py-2 rounded-xl">
              {item.caption}
            </span>
          </div>

          <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
            <Image 
              src={item.src}
              alt={item.caption} 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroGallery;
