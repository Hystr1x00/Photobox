import { createPhotoStrip } from './canvasUtils';

/**
 * Download photo strip as PNG
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLAnchorElement} downloadLink - Download link element
 * @param {Array<string>} photos - Array of photo data URLs
 * @param {number} layout - Number of photos in layout
 * @param {string} filter - Filter type to apply
 * @param {string} customMoment - Custom moment text
 * @returns {Promise<void>}
 */
export const downloadPhotoStrip = async (canvas, downloadLink, photos, layout, filter, customMoment) => {
  await createPhotoStrip(canvas, photos, layout, filter, customMoment);
  
  downloadLink.href = canvas.toDataURL('image/png');
  downloadLink.download = `comic-strip-${Date.now()}.png`;
  downloadLink.click();
};

