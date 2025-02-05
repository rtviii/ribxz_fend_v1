import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';


const StructureMedia = ({ structureId, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  
  // Get media ID - either actual ID if available, or consistent random fallback
  const mediaId = useMemo(() => {
    const requestedId = `${structureId.toUpperCase()}.png`;
    
    if (RCSB_IDs.includes(requestedId)) {
      return structureId.toUpperCase();
    } else {
      // Generate consistent random ID for this structure
      const utf8Encode = new TextEncoder();
      const byteval = utf8Encode.encode(structureId).reduce((acc, byte) => acc + byte, 0);
      const fallbackId = RCSB_IDs[byteval % RCSB_IDs.length].replace('.png', '');
      return fallbackId;
    }
  }, [structureId]);

  // Only load component when it's in viewport
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsGifLoaded(false);
  }, []);

  if (!inView) {
    return <div ref={ref} className={className} />;
  }

  return (
    <div 
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static Image */}
      <Image
        alt={`Structure ${structureId}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovered && isGifLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        height={160}
        width={400}
        src={`/ribxz_pics/${mediaId}.png`}
        priority={false}
        loading="lazy"
      />
      
      {/* Load GIF only when hovered */}
      {isHovered && (
        <Image
          alt={`Structure ${structureId} animated`}
          className={`absolute top-0 left-0 w-full h-full object-cover 
                     transition-opacity duration-300 ${isGifLoaded ? 'opacity-100' : 'opacity-0'}`}
          height={160}
          width={400}
          src={`${mediaId}.gif`}
          onLoadingComplete={() => setIsGifLoaded(true)}
          priority={false}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default StructureMedia;