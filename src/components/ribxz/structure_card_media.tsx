import React, { useState } from 'react';
import Image from 'next/image';
interface StructureMediaProps {
  structureId: string;
  className?: string;
}

const StructureMedia: React.FC<StructureMediaProps> = ({ structureId, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsGifLoaded(false);
      }}
    >
      {/* Static PNG */}
      <Image
        alt={`Structure ${structureId}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovered && isGifLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        height={160}
        width={400}
        src={`/static/thumbnails/${structureId}.png`}
        priority={false}
        loading="lazy"
      />
      
      {/* Animated GIF (loaded on hover) */}
      {isHovered && (
        <Image
          alt={`Structure ${structureId} animated`}
          className={`absolute top-0 left-0 w-full h-full object-cover 
                     transition-opacity duration-300 ${isGifLoaded ? 'opacity-100' : 'opacity-0'}`}
          height={160}
          width={400}
          src={`/static/thumbnails/${structureId}.gif`}
          onLoadingComplete={() => setIsGifLoaded(true)}
          priority={false}
          loading="lazy"
        />
      )}
    </div>
  );
};