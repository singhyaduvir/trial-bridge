// components/HeroGallery.tsx
import Image from 'next/image';

const HeroGallery = () => {
  const galleryItems = [
    { id: 1, src: '/patient-care.png', caption: 'Personalized Matching' },
    { id: 2, src: '/samples.png', caption: 'Advanced Research' },
    { id: 3, src: '/after-care.png', caption: 'Success Stories' },
  ];

  return (
    //max-w-md to max-w-4xl and added more vertical spacing (space-y-16)
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
          {/* Caption */}
          <div 
            className={`
              absolute -top-10 left-0 z-20 
              transition-all duration-300 ease-out
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            `}
          >
            <span className="text-sm md:text-base font-bold text-blue-900 bg-white/95 px-4 py-2 rounded-lg shadow-md border border-gray-100">
              {item.caption}
            </span>
          </div>

          {/* 16:9 Rectangular Container */}
          {/* rounded-2xl and border-4 for better scale balance */}
          <div className="relative w-full aspect-video overflow-hidden rounded-2xl shadow-xl border-4 border-white">
            <Image 
              src={item.src}
              alt={item.caption} 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroGallery;