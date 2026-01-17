import { useState, useEffect } from 'react';
import { applyPixelatedFilter } from '../utils/filters';

/**
 * Custom hook for photo processing with filters
 * @param {Array} photos - Array of photo data URLs
 * @param {string} filter - Current filter type
 * @returns {Array} - Array of filtered photo data URLs
 */
export const usePhotoProcessing = (photos, filter) => {
  const [filteredPhotos, setFilteredPhotos] = useState([]);

  useEffect(() => {
    if (photos.length === 0) {
      setFilteredPhotos([]);
      return;
    }

    const processPhotos = async () => {
      const processed = await Promise.all(
        photos.map(async (photo, index) => {
          if (!photo) return { index, filteredSrc: null };
          
          return new Promise((resolve) => {
            const tempCanvas = document.createElement('canvas');
            const tempImg = new Image();
            
            tempImg.onload = () => {
              const targetWidth = 800;
              const targetHeight = 600;
              const targetAspect = targetWidth / targetHeight;

              tempCanvas.width = targetWidth;
              tempCanvas.height = targetHeight;
              const tempCtx = tempCanvas.getContext('2d');

              // Calculate crop dimensions
              const imgAspect = tempImg.width / tempImg.height;
              let sourceWidth, sourceHeight, sourceX, sourceY;

              if (imgAspect > targetAspect) {
                sourceHeight = tempImg.height;
                sourceWidth = sourceHeight * targetAspect;
                sourceX = (tempImg.width - sourceWidth) / 2;
                sourceY = 0;
              } else {
                sourceWidth = tempImg.width;
                sourceHeight = sourceWidth / targetAspect;
                sourceX = 0;
                sourceY = (tempImg.height - sourceHeight) / 2;
              }

              // Draw cropped image
              tempCtx.drawImage(
                tempImg,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, targetWidth, targetHeight
              );

              const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
              const filteredData = applyPixelatedFilter(tempCtx, imageData, filter);
              tempCtx.putImageData(filteredData, 0, 0);
              const filteredSrc = tempCanvas.toDataURL();
              resolve({ index, filteredSrc });
            };
            
            tempImg.src = photo;
          });
        })
      );

      // Create array with same length as photos, maintaining index mapping
      const filteredArray = new Array(photos.length).fill(null);
      processed.forEach(({ index, filteredSrc }) => {
        filteredArray[index] = filteredSrc;
      });
      
      setFilteredPhotos(filteredArray);
    };

    processPhotos();
  }, [photos, filter]);

  return filteredPhotos;
};

