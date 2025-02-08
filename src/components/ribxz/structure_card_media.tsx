import React, {useState} from 'react';
import Image from 'next/image';
interface StructureMediaProps {
    structureId: string;
    className?: string;
}

export const getMediaUrl = (path: string) => {
    if (process.env.NODE_ENV === 'development') {
        return `http://localhost:8000/static/${path}`; // Your Django dev server
    }
    return `/static/${path}`; // Production (nginx)
};

export const StructureMedia: React.FC<StructureMediaProps> = ({structureId, className}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isGifLoaded, setIsGifLoaded] = useState(false);
    const [hasPngFailed, setHasPngFailed] = useState(false);
    const [hasGifFailed, setHasGifFailed] = useState(false);

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => !hasGifFailed && setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsGifLoaded(false);
            }}>
            {/* Static PNG */}
            <Image
                alt={`Structure ${structureId}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isHovered && isGifLoaded ? 'opacity-0' : 'opacity-100'
                }`}
                height={160}
                width={400}
                src={hasPngFailed 
                    ? getMediaUrl('thumbnails/5AFI.png') 
                    : getMediaUrl(`thumbnails/${structureId}.png`)
                }
                onError={() => setHasPngFailed(true)}
                priority={false}
                loading="lazy"
            />

            {/* Animated GIF (loaded on hover) */}
            {isHovered && !hasGifFailed && (
                <Image
                    alt={`Structure ${structureId} animated`}
                    className={`absolute top-0 left-0 w-full h-full object-cover 
                     transition-opacity duration-300 ${isGifLoaded ? 'opacity-100' : 'opacity-0'}`}
                    height={160}
                    width={400}
                    src={getMediaUrl(`thumbnails/${structureId}.gif`)}
                    onError={() => setHasGifFailed(true)}
                    onLoadingComplete={() => setIsGifLoaded(true)}
                    priority={false}
                    loading="lazy"
                />
            )}
        </div>
    );
};
