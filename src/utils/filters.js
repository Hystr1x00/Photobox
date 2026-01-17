/**
 * Apply pixelated filter to image data
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {ImageData} imgData - Image data to filter
 * @param {string} filterType - Type of filter to apply ('normal', 'halftone', 'dithered', 'pixelated', 'sepia')
 * @returns {ImageData} - Filtered image data
 */
export const applyPixelatedFilter = (ctx, imgData, filterType) => {
  const pixels = imgData.data;
  
  // If normal filter, return original without grayscale conversion
  if (filterType === 'normal') {
    return imgData;
  }
  
  // Convert to grayscale first
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }
  
  if (filterType === 'halftone') {
    // Halftone effect - lighter and more subtle
    const dotSize = 2;
    const spacing = 6; // Increased spacing for lighter effect
    
    for (let y = 0; y < imgData.height; y += spacing) {
      for (let x = 0; x < imgData.width; x += spacing) {
        // Sample average brightness in the area
        let totalBrightness = 0;
        let sampleCount = 0;
        
        for (let sy = 0; sy < spacing && (y + sy) < imgData.height; sy++) {
          for (let sx = 0; sx < spacing && (x + sx) < imgData.width; sx++) {
            const idx = ((y + sy) * imgData.width + (x + sx)) * 4;
            totalBrightness += pixels[idx];
            sampleCount++;
          }
        }
        
        const avgBrightness = totalBrightness / sampleCount;
        // Lighter halftone: smaller dots, more white space preserved
        const dotRadius = Math.floor((avgBrightness / 255) * (dotSize * 0.6)); // Reduced dot size
        
        // Draw halftone dot (only if dark enough)
        if (avgBrightness < 200) { // Only draw dots for darker areas
          for (let dy = -dotSize; dy <= dotSize; dy++) {
            for (let dx = -dotSize; dx <= dotSize; dx++) {
              const px = x + spacing / 2 + dx;
              const py = y + spacing / 2 + dy;
              
              if (px >= 0 && px < imgData.width && py >= 0 && py < imgData.height) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                const idx = (py * imgData.width + px) * 4;
                
                if (dist <= dotRadius) {
                  // Blend with original instead of pure black
                  const blendFactor = 0.7; // Keep some original color
                  pixels[idx] = pixels[idx] * blendFactor;
                  pixels[idx + 1] = pixels[idx + 1] * blendFactor;
                  pixels[idx + 2] = pixels[idx + 2] * blendFactor;
                }
                // Keep white background for lighter areas
              }
            }
          }
        }
      }
    }
  } else if (filterType === 'dithered') {
    // Floyd-Steinberg dithering
    for (let y = 0; y < imgData.height; y++) {
      for (let x = 0; x < imgData.width; x++) {
        const i = (y * imgData.width + x) * 4;
        const oldPixel = pixels[i];
        const newPixel = oldPixel < 128 ? 0 : 255;
        pixels[i] = newPixel;
        pixels[i + 1] = newPixel;
        pixels[i + 2] = newPixel;
        
        const err = oldPixel - newPixel;
        if (x + 1 < imgData.width) {
          const i1 = i + 4;
          pixels[i1] += err * 7 / 16;
        }
        if (y + 1 < imgData.height) {
          if (x > 0) {
            const i2 = ((y + 1) * imgData.width + (x - 1)) * 4;
            pixels[i2] += err * 3 / 16;
          }
          const i3 = ((y + 1) * imgData.width + x) * 4;
          pixels[i3] += err * 5 / 16;
          if (x + 1 < imgData.width) {
            const i4 = ((y + 1) * imgData.width + (x + 1)) * 4;
            pixels[i4] += err * 1 / 16;
          }
        }
      }
    }
  } else if (filterType === 'pixelated') {
    // Pixelation effect
    const pixelSize = 6;
    for (let y = 0; y < imgData.height; y += pixelSize) {
      for (let x = 0; x < imgData.width; x += pixelSize) {
        const i = (y * imgData.width + x) * 4;
        const avgColor = pixels[i];
        
        for (let dy = 0; dy < pixelSize; dy++) {
          for (let dx = 0; dx < pixelSize; dx++) {
            if (y + dy < imgData.height && x + dx < imgData.width) {
              const idx = ((y + dy) * imgData.width + (x + dx)) * 4;
              pixels[idx] = avgColor;
              pixels[idx + 1] = avgColor;
              pixels[idx + 2] = avgColor;
            }
          }
        }
      }
    }
  } else if (filterType === 'sepia') {
    // Sepia/vintage effect - warm brown tone
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Convert to sepia
      const tr = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      const tg = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      const tb = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      
      pixels[i] = tr;
      pixels[i + 1] = tg;
      pixels[i + 2] = tb;
    }
  }
  
  return imgData;
};

