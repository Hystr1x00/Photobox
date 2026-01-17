import { applyPixelatedFilter } from './filters';

/**
 * Draw photo decorations on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} stripWidth - Width of the strip
 * @param {number} borderWidth - Border width
 * @param {number} yPos - Y position of photo
 * @param {number} photoHeight - Height of photo
 * @param {number} index - Photo index (0-based)
 * @param {number} layout - Total layout count
 */
export const drawPhotoDecorations = (ctx, stripWidth, borderWidth, yPos, photoHeight, index, layout) => {
  // Triple border effect (comic style)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.strokeRect(borderWidth, yPos, stripWidth - (borderWidth * 2), photoHeight);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(borderWidth + 12, yPos + 12, stripWidth - (borderWidth * 2) - 24, photoHeight - 24);

  // Retro decorative elements for each photo
  ctx.fillStyle = '#000000';

  // Corner decorations - retro style
  const cornerSize = 20;
  const cornerOffset = 8;

  // Top-left corner decoration
  ctx.beginPath();
  ctx.moveTo(borderWidth - cornerOffset, yPos - cornerOffset);
  ctx.lineTo(borderWidth + cornerSize, yPos - cornerOffset);
  ctx.lineTo(borderWidth - cornerOffset, yPos + cornerSize);
  ctx.closePath();
  ctx.fill();

  // Top-right corner decoration
  ctx.beginPath();
  ctx.moveTo(stripWidth - borderWidth + cornerOffset, yPos - cornerOffset);
  ctx.lineTo(stripWidth - borderWidth - cornerSize, yPos - cornerOffset);
  ctx.lineTo(stripWidth - borderWidth + cornerOffset, yPos + cornerSize);
  ctx.closePath();
  ctx.fill();

  // Bottom-left corner decoration
  ctx.beginPath();
  ctx.moveTo(borderWidth - cornerOffset, yPos + photoHeight + cornerOffset);
  ctx.lineTo(borderWidth + cornerSize, yPos + photoHeight + cornerOffset);
  ctx.lineTo(borderWidth - cornerOffset, yPos + photoHeight - cornerSize);
  ctx.closePath();
  ctx.fill();

  // Bottom-right corner decoration
  ctx.beginPath();
  ctx.moveTo(stripWidth - borderWidth + cornerOffset, yPos + photoHeight + cornerOffset);
  ctx.lineTo(stripWidth - borderWidth - cornerSize, yPos + photoHeight + cornerOffset);
  ctx.lineTo(stripWidth - borderWidth + cornerOffset, yPos + photoHeight - cornerSize);
  ctx.closePath();
  ctx.fill();

  // Retro photo number badge (top right of each photo)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(stripWidth - borderWidth - 50, yPos + 10, 40, 30);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(stripWidth - borderWidth - 50, yPos + 10, 40, 30);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`#${index + 1}`, stripWidth - borderWidth - 30, yPos + 25);

  // Retro stickers and text on each photo
  const stickers = [
    { text: 'INSTANT', x: borderWidth + 15, y: yPos + photoHeight - 50, color: '#ffff00', rotate: -8 },
    { text: 'VINTAGE', x: stripWidth - borderWidth - 100, y: yPos + photoHeight - 80, color: '#ff6b6b', rotate: 5 },
    { text: 'RETRO', x: borderWidth + 20, y: yPos + 40, color: '#4ecdc4', rotate: -5 },
    { text: 'CLASSIC', x: stripWidth - borderWidth - 90, y: yPos + 50, color: '#ffe66d', rotate: 8 },
    { text: 'MEMORY', x: borderWidth + 15, y: yPos + photoHeight - 100, color: '#95e1d3', rotate: -3 },
    { text: 'KEEP', x: stripWidth - borderWidth - 70, y: yPos + photoHeight - 30, color: '#f38181', rotate: 6 }
  ];

  // Draw stickers (rotate through available stickers based on index)
  const stickerIndex = index % stickers.length;
  const sticker = stickers[stickerIndex];

  // Save context for rotation
  ctx.save();

  // Draw sticker background (rounded rectangle)
  const stickerWidth = sticker.text.length * 12 + 20;
  const stickerHeight = 35;
  const stickerX = sticker.x;
  const stickerY = sticker.y;

  // Rotate context
  ctx.translate(stickerX + stickerWidth / 2, stickerY + stickerHeight / 2);
  ctx.rotate(sticker.rotate * Math.PI / 180);

  // Draw sticker background (rounded rectangle manually)
  const radius = 8;
  const x = -stickerWidth / 2;
  const y = -stickerHeight / 2;
  const w = stickerWidth;
  const h = stickerHeight;

  ctx.fillStyle = sticker.color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();

  // Draw sticker border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw sticker text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.text, 0, 0);

  // Restore context
  ctx.restore();

  // Additional retro text decorations (only on photos, not overlapping with footer)
  if (index < layout - 1) {
    const retroTexts = [
      { text: 'INSTANT PHOTOS', x: borderWidth + (stripWidth - borderWidth * 2) / 2, y: yPos + 30 }
    ];

    // Draw retro text (one per photo, rotating)
    const textIndex = index % retroTexts.length;
    const retroText = retroTexts[textIndex];

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text with outline effect
    ctx.strokeText(retroText.text, retroText.x, retroText.y);
    ctx.fillText(retroText.text, retroText.x, retroText.y);
  }

  // Retro decorative dots pattern (top border)
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 8; i++) {
    const dotX = borderWidth + 20 + (i * 90);
    const dotY = yPos - 15;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Retro decorative lines (sides)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  // Left side lines
  for (let i = 0; i < 5; i++) {
    const lineY = yPos + 50 + (i * 100);
    ctx.beginPath();
    ctx.moveTo(borderWidth - 12, lineY);
    ctx.lineTo(borderWidth - 5, lineY);
    ctx.stroke();
  }
  // Right side lines
  for (let i = 0; i < 5; i++) {
    const lineY = yPos + 50 + (i * 100);
    ctx.beginPath();
    ctx.moveTo(stripWidth - borderWidth + 5, lineY);
    ctx.lineTo(stripWidth - borderWidth + 12, lineY);
    ctx.stroke();
  }
};

/**
 * Draw header decorations on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} headerY - Header Y position
 */
export const drawHeaderDecorations = (ctx, canvasWidth, headerY) => {
  // "PHOTO BOOTH" text at top with retro style
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  const textY = headerY + 40;
  ctx.strokeText('PHOTO BOOTH', canvasWidth / 2, textY);
  ctx.fillText('PHOTO BOOTH', canvasWidth / 2, textY);

  // Retro sticker on header - "INSTANT"
  ctx.save();
  ctx.translate(120, headerY + 30);
  ctx.rotate(-12 * Math.PI / 180);
  ctx.fillStyle = '#ffff00';
  const instantWidth = 80;
  const instantHeight = 30;
  ctx.beginPath();
  ctx.moveTo(0, instantHeight / 2);
  ctx.lineTo(instantWidth, instantHeight / 2);
  ctx.lineTo(instantWidth - 10, -instantHeight / 2);
  ctx.lineTo(10, -instantHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('INSTANT', instantWidth / 2, 0);
  ctx.restore();

  // Retro sticker on header - "VINTAGE"
  ctx.save();
  ctx.translate(canvasWidth - 120, headerY + 30);
  ctx.rotate(12 * Math.PI / 180);
  ctx.fillStyle = '#ff6b6b';
  const vintageWidth = 90;
  const vintageHeight = 30;
  ctx.beginPath();
  ctx.moveTo(0, vintageHeight / 2);
  ctx.lineTo(vintageWidth, vintageHeight / 2);
  ctx.lineTo(vintageWidth - 10, -vintageHeight / 2);
  ctx.lineTo(10, -vintageHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VINTAGE', vintageWidth / 2, 0);
  ctx.restore();

  // Decorative lines under header
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2 - 100, headerY + 50);
  ctx.lineTo(canvasWidth / 2 + 100, headerY + 50);
  ctx.stroke();
};

/**
 * Draw footer decorations on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {string} customMoment - Custom moment text
 */
export const drawFooterDecorations = (ctx, canvasWidth, canvasHeight, customMoment) => {
  const footerY = canvasHeight - 20;

  // Custom moment text (above line)
  if (customMoment && customMoment.trim()) {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    const momentY = footerY - 38;
    ctx.strokeText(customMoment.toUpperCase(), canvasWidth / 2, momentY);
    ctx.fillText(customMoment.toUpperCase(), canvasWidth / 2, momentY);
  }

  // Decorative line above date
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  const lineY = customMoment && customMoment.trim() ? footerY - 28 : footerY - 25;
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2 - 100, lineY);
  ctx.lineTo(canvasWidth / 2 + 100, lineY);
  ctx.stroke();

  // Date stamp style text
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeText(dateStr.toUpperCase(), canvasWidth / 2, footerY);
  ctx.fillText(dateStr.toUpperCase(), canvasWidth / 2, footerY);

  // Retro sticker on footer left - "RETRO"
  ctx.save();
  ctx.translate(100, footerY - 50);
  ctx.rotate(-8 * Math.PI / 180);
  ctx.fillStyle = '#4ecdc4';
  const retroWidth = 70;
  const retroHeight = 25;
  ctx.beginPath();
  ctx.moveTo(0, retroHeight / 2);
  ctx.lineTo(retroWidth, retroHeight / 2);
  ctx.lineTo(retroWidth - 8, -retroHeight / 2);
  ctx.lineTo(8, -retroHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RETRO', retroWidth / 2, 0);
  ctx.restore();

  // Retro sticker on footer right - "CLASSIC"
  ctx.save();
  ctx.translate(canvasWidth - 100, footerY - 50);
  ctx.rotate(8 * Math.PI / 180);
  ctx.fillStyle = '#95e1d3';
  const classicWidth = 80;
  const classicHeight = 25;
  ctx.beginPath();
  ctx.moveTo(0, classicHeight / 2);
  ctx.lineTo(classicWidth, classicHeight / 2);
  ctx.lineTo(classicWidth - 8, -classicHeight / 2);
  ctx.lineTo(8, -classicHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLASSIC', classicWidth / 2, 0);
  ctx.restore();
};

/**
 * Draw corner decorations on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export const drawCornerDecorations = (ctx, canvasWidth, canvasHeight) => {
  const cornerRadius = 12;
  const cornerDistance = 20;

  // Top-left corner
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cornerDistance, cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cornerDistance - cornerRadius, cornerDistance);
  ctx.lineTo(cornerDistance - cornerRadius - 8, cornerDistance);
  ctx.lineTo(cornerDistance, cornerDistance - cornerRadius - 8);
  ctx.lineTo(cornerDistance, cornerDistance - cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Top-right corner
  ctx.beginPath();
  ctx.arc(canvasWidth - cornerDistance, cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(canvasWidth - cornerDistance + cornerRadius, cornerDistance);
  ctx.lineTo(canvasWidth - cornerDistance + cornerRadius + 8, cornerDistance);
  ctx.lineTo(canvasWidth - cornerDistance, cornerDistance - cornerRadius - 8);
  ctx.lineTo(canvasWidth - cornerDistance, cornerDistance - cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Bottom-left corner
  ctx.beginPath();
  ctx.arc(cornerDistance, canvasHeight - cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cornerDistance - cornerRadius, canvasHeight - cornerDistance);
  ctx.lineTo(cornerDistance - cornerRadius - 8, canvasHeight - cornerDistance);
  ctx.lineTo(cornerDistance, canvasHeight - cornerDistance + cornerRadius + 8);
  ctx.lineTo(cornerDistance, canvasHeight - cornerDistance + cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Bottom-right corner
  ctx.beginPath();
  ctx.arc(canvasWidth - cornerDistance, canvasHeight - cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(canvasWidth - cornerDistance + cornerRadius, canvasHeight - cornerDistance);
  ctx.lineTo(canvasWidth - cornerDistance + cornerRadius + 8, canvasHeight - cornerDistance);
  ctx.lineTo(canvasWidth - cornerDistance, canvasHeight - cornerDistance + cornerRadius + 8);
  ctx.lineTo(canvasWidth - cornerDistance, canvasHeight - cornerDistance + cornerRadius);
  ctx.closePath();
  ctx.fill();
};

/**
 * Draw side pattern dots on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export const drawSidePatternDots = (ctx, canvasWidth, canvasHeight) => {
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 10; i++) {
    const dotY = 60 + (i * 50);
    if (dotY < canvasHeight - 60) {
      // Left side dots
      ctx.beginPath();
      ctx.arc(15, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
      // Right side dots
      ctx.beginPath();
      ctx.arc(canvasWidth - 15, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

/**
 * Draw borders on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export const drawBorders = (ctx, canvasWidth, canvasHeight) => {
  // Outer thick border with retro style
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, canvasWidth - 12, canvasHeight - 12);

  // Inner decorative border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, canvasWidth - 36, canvasHeight - 36);
};

/**
 * Create and download photo strip
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array<string>} photos - Array of photo data URLs
 * @param {number} layout - Number of photos in layout
 * @param {string} filter - Filter type to apply
 * @param {string} customMoment - Custom moment text
 * @returns {Promise<void>}
 */
export const createPhotoStrip = async (canvas, photos, layout, filter, customMoment) => {
  const ctx = canvas.getContext('2d');

  const stripWidth = 800;
  const photoHeight = 600;
  const borderWidth = 30;
  const innerBorder = 20;
  const headerPadding = 80;
  const footerPadding = 100;
  canvas.height = (photoHeight * layout) + (borderWidth * 2) + (innerBorder * (layout - 1)) + headerPadding + footerPadding;
  canvas.width = stripWidth;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load all images first
  const imagePromises = photos
    .filter(photo => photo !== null)
    .map((photo, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ img, index });
        img.src = photo;
      });
    });

  const loadedImages = await Promise.all(imagePromises);

  // Draw photos with filter
  const photoStartY = borderWidth + headerPadding;
  loadedImages.forEach(({ img, index }) => {
    const yPos = photoStartY + (index * (photoHeight + innerBorder));
    const drawWidth = stripWidth - (borderWidth * 2);
    const targetAspect = drawWidth / photoHeight;

    // Calculate crop dimensions
    const imgAspect = img.width / img.height;
    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (imgAspect > targetAspect) {
      sourceHeight = img.height;
      sourceWidth = sourceHeight * targetAspect;
      sourceX = (img.width - sourceWidth) / 2;
      sourceY = 0;
    } else {
      sourceWidth = img.width;
      sourceHeight = sourceWidth / targetAspect;
      sourceX = 0;
      sourceY = (img.height - sourceHeight) / 2;
    }

    // Draw cropped image
    ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, borderWidth, yPos, drawWidth, photoHeight);

    // Apply filter
    const imageData = ctx.getImageData(borderWidth, yPos, drawWidth, photoHeight);
    const filteredData = applyPixelatedFilter(ctx, imageData, filter);
    ctx.putImageData(filteredData, borderWidth, yPos);

    // Draw decorations
    drawPhotoDecorations(ctx, stripWidth, borderWidth, yPos, photoHeight, index, layout);
  });

  // Draw header
  const headerY = 25;
  drawHeaderDecorations(ctx, canvas.width, headerY);

  // Draw corners
  drawCornerDecorations(ctx, canvas.width, canvas.height);

  // Draw footer
  drawFooterDecorations(ctx, canvas.width, canvas.height, customMoment);

  // Draw side pattern dots
  drawSidePatternDots(ctx, canvas.width, canvas.height);

  // Draw borders
  drawBorders(ctx, canvas.width, canvas.height);
};

