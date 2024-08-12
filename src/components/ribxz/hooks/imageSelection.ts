'use client';

import { useCallback, useMemo } from 'react';

export const useImageSelection = (imageFiles) => {
  const memoizedImageFiles = useMemo(() => new Set(imageFiles), [imageFiles]);

  const getImageForId = useCallback((id) => {
    const imageFileName = `${id}.png`;
    
    if (memoizedImageFiles.has(imageFileName)) {
      return imageFileName;
    } else {
      // If the image doesn't exist, return a random image
      const randomIndex = Math.floor(Math.random() * imageFiles.length);
      return imageFiles[randomIndex];
    }
  }, [memoizedImageFiles, imageFiles]);

  return { getImageForId };
};