// components/HeroGallery.tsx
import Image from 'next/image';

const HeroGallery = () => {
  const galleryItems = [
    {
      id: 1,
      src: '/patient-care.png',
      caption: 'Personalized Matching',
    },
    {
      id: 2,
      src: '/samples.png',
      caption: 'Advanced Research',
    },
    {
      id: 3,
      src: '/after-care.png',
      caption: 'Success Stories',
    },
  ];

  return (
    <div className="flex flex-col space-y-4 w-full max-w-md mx-auto p-4">
      {galleryItems.map((item, index) => (
        <div
          key={item.id}
          // Zigzag logic: Evens left, Odds right
          // Using w-[60%] ensures they overlap visually or leave space for the zigzag effect
          className={`
            relative group w-[60%] h-32 md:h-36 
            animate-float group-hover:[animation-play-state:paused] 
            ${index % 2 !== 0 ? 'self-end' : 'self-start'}
          `}
        >
          {/* Caption: Smaller text, tighter positioning */}
          <div 
            className={`
              absolute -top-8 left-0 z-20 
              transition-all duration-300 ease-out
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            `}
          >
            <span className="text-xs md:text-sm font-bold text-blue-900 bg-white/95 px-3 py-1 rounded shadow-sm border border-gray-100">
              {item.caption}
            </span>
          </div>

          {/* Image Container */}
          <div className="relative w-full h-full overflow-hidden rounded-xl shadow-md border-2 border-white">
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