import { applyPixelatedFilter } from './filters';
import {
  drawPhotoDecorations,
  drawHeaderDecorations,
  drawFooterDecorations,
  drawCornerDecorations,
  drawSidePatternDots,
  drawBorders
} from './canvasUtils';

/**
 * Draw video decorations (scaled version for video)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} stripX - X position of strip
 * @param {number} stripWidth - Width of strip
 * @param {number} borderWidth - Border width (scaled)
 * @param {number} yPos - Y position of photo
 * @param {number} photoHeight - Height of photo (scaled)
 * @param {number} index - Photo index
 * @param {number} layout - Total layout count
 * @param {number} scale - Scale factor
 */
export const drawVideoPhotoDecorations = (ctx, stripX, stripWidth, borderWidth, yPos, photoHeight, index, layout, scale) => {
  // Triple border effect (comic style)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8 * scale;
  ctx.strokeRect(stripX + borderWidth, yPos, stripWidth - (borderWidth * 2), photoHeight);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3 * scale;
  ctx.strokeRect(stripX + borderWidth + 12 * scale, yPos + 12 * scale, stripWidth - (borderWidth * 2) - 24 * scale, photoHeight - 24 * scale);

  // Retro decorative elements for each photo
  ctx.fillStyle = '#000000';

  // Corner decorations - retro style
  const cornerSize = 20 * scale;
  const cornerOffset = 8 * scale;

  // Top-left corner decoration
  ctx.beginPath();
  ctx.moveTo(stripX + borderWidth - cornerOffset, yPos - cornerOffset);
  ctx.lineTo(stripX + borderWidth + cornerSize, yPos - cornerOffset);
  ctx.lineTo(stripX + borderWidth - cornerOffset, yPos + cornerSize);
  ctx.closePath();
  ctx.fill();

  // Top-right corner decoration
  ctx.beginPath();
  ctx.moveTo(stripX + stripWidth - borderWidth + cornerOffset, yPos - cornerOffset);
  ctx.lineTo(stripX + stripWidth - borderWidth - cornerSize, yPos - cornerOffset);
  ctx.lineTo(stripX + stripWidth - borderWidth + cornerOffset, yPos + cornerSize);
  ctx.closePath();
  ctx.fill();

  // Bottom-left corner decoration
  ctx.beginPath();
  ctx.moveTo(stripX + borderWidth - cornerOffset, yPos + photoHeight + cornerOffset);
  ctx.lineTo(stripX + borderWidth + cornerSize, yPos + photoHeight + cornerOffset);
  ctx.lineTo(stripX + borderWidth - cornerOffset, yPos + photoHeight - cornerSize);
  ctx.closePath();
  ctx.fill();

  // Bottom-right corner decoration
  ctx.beginPath();
  ctx.moveTo(stripX + stripWidth - borderWidth + cornerOffset, yPos + photoHeight + cornerOffset);
  ctx.lineTo(stripX + stripWidth - borderWidth - cornerSize, yPos + photoHeight + cornerOffset);
  ctx.lineTo(stripX + stripWidth - borderWidth + cornerOffset, yPos + photoHeight - cornerSize);
  ctx.closePath();
  ctx.fill();

  // Retro photo number badge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(stripX + stripWidth - borderWidth - 50 * scale, yPos + 10 * scale, 40 * scale, 30 * scale);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3 * scale;
  ctx.strokeRect(stripX + stripWidth - borderWidth - 50 * scale, yPos + 10 * scale, 40 * scale, 30 * scale);
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${20 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`#${index + 1}`, stripX + stripWidth - borderWidth - 30 * scale, yPos + 25 * scale);

  // Retro stickers
  const stickers = [
    { text: 'INSTANT', x: stripX + borderWidth + 15 * scale, y: yPos + photoHeight - 50 * scale, color: '#ffff00', rotate: -8 },
    { text: 'VINTAGE', x: stripX + stripWidth - borderWidth - 100 * scale, y: yPos + photoHeight - 80 * scale, color: '#ff6b6b', rotate: 5 },
    { text: 'RETRO', x: stripX + borderWidth + 20 * scale, y: yPos + 40 * scale, color: '#4ecdc4', rotate: -5 },
    { text: 'CLASSIC', x: stripX + stripWidth - borderWidth - 90 * scale, y: yPos + 50 * scale, color: '#ffe66d', rotate: 8 },
    { text: 'MEMORY', x: stripX + borderWidth + 15 * scale, y: yPos + photoHeight - 100 * scale, color: '#95e1d3', rotate: -3 },
    { text: 'KEEP', x: stripX + stripWidth - borderWidth - 70 * scale, y: yPos + photoHeight - 30 * scale, color: '#f38181', rotate: 6 }
  ];

  const stickerIndex = index % stickers.length;
  const sticker = stickers[stickerIndex];

  ctx.save();
  const stickerWidth = (sticker.text.length * 12 + 20) * scale;
  const stickerHeight = 35 * scale;
  ctx.translate(sticker.x + stickerWidth / 2, sticker.y + stickerHeight / 2);
  ctx.rotate(sticker.rotate * Math.PI / 180);

  const radius = 8 * scale;
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

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${18 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.text, 0, 0);
  ctx.restore();

  // Additional retro text
  if (index < layout - 1) {
    const retroTexts = [
      { text: 'INSTANT PHOTOS', x: stripX + borderWidth + (stripWidth - borderWidth * 2) / 2, y: yPos + 30 * scale }
    ];
    const textIndex = index % retroTexts.length;
    const retroText = retroTexts[textIndex];

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4 * scale;
    ctx.font = `bold ${16 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(retroText.text, retroText.x, retroText.y);
    ctx.fillText(retroText.text, retroText.x, retroText.y);
  }

  // Retro decorative dots
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 8; i++) {
    const dotX = stripX + borderWidth + 20 * scale + (i * 90 * scale);
    const dotY = yPos - 15 * scale;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Retro decorative lines
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2 * scale;
  for (let i = 0; i < 5; i++) {
    const lineY = yPos + 50 * scale + (i * 100 * scale);
    ctx.beginPath();
    ctx.moveTo(stripX + borderWidth - 12 * scale, lineY);
    ctx.lineTo(stripX + borderWidth - 5 * scale, lineY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(stripX + stripWidth - borderWidth + 5 * scale, lineY);
    ctx.lineTo(stripX + stripWidth - borderWidth + 12 * scale, lineY);
    ctx.stroke();
  }
};

/**
 * Draw video header decorations (scaled)
 */
export const drawVideoHeaderDecorations = (ctx, stripX, stripWidth, headerY, scale) => {
  const textY = headerY + 40 * scale;
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${28 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 * scale;
  ctx.strokeText('PHOTO BOOTH', stripX + stripWidth / 2, textY);
  ctx.fillText('PHOTO BOOTH', stripX + stripWidth / 2, textY);

  // INSTANT sticker
  ctx.save();
  ctx.translate(stripX + 120 * scale, headerY + 30 * scale);
  ctx.rotate(-12 * Math.PI / 180);
  ctx.fillStyle = '#ffff00';
  const instantWidth = 80 * scale;
  const instantHeight = 30 * scale;
  ctx.beginPath();
  ctx.moveTo(0, instantHeight / 2);
  ctx.lineTo(instantWidth, instantHeight / 2);
  ctx.lineTo(instantWidth - 10 * scale, -instantHeight / 2);
  ctx.lineTo(10 * scale, -instantHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${16 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('INSTANT', instantWidth / 2, 0);
  ctx.restore();

  // VINTAGE sticker
  ctx.save();
  ctx.translate(stripX + stripWidth - 120 * scale, headerY + 30 * scale);
  ctx.rotate(12 * Math.PI / 180);
  ctx.fillStyle = '#ff6b6b';
  const vintageWidth = 90 * scale;
  const vintageHeight = 30 * scale;
  ctx.beginPath();
  ctx.moveTo(0, vintageHeight / 2);
  ctx.lineTo(vintageWidth, vintageHeight / 2);
  ctx.lineTo(vintageWidth - 10 * scale, -vintageHeight / 2);
  ctx.lineTo(10 * scale, -vintageHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${16 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VINTAGE', vintageWidth / 2, 0);
  ctx.restore();

  // Decorative line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(stripX + stripWidth / 2 - 100 * scale, headerY + 50 * scale);
  ctx.lineTo(stripX + stripWidth / 2 + 100 * scale, headerY + 50 * scale);
  ctx.stroke();
};

/**
 * Draw video footer decorations (scaled)
 */
export const drawVideoFooterDecorations = (ctx, stripX, stripWidth, footerY, customMoment, scale) => {
  // Custom moment text
  if (customMoment && customMoment.trim()) {
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${24 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * scale;
    const momentY = footerY - 38 * scale;
    ctx.strokeText(customMoment.toUpperCase(), stripX + stripWidth / 2, momentY);
    ctx.fillText(customMoment.toUpperCase(), stripX + stripWidth / 2, momentY);
  }

  // Decorative line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3 * scale;
  const lineY = customMoment && customMoment.trim() ? footerY - 28 * scale : footerY - 25 * scale;
  ctx.beginPath();
  ctx.moveTo(stripX + stripWidth / 2 - 100 * scale, lineY);
  ctx.lineTo(stripX + stripWidth / 2 + 100 * scale, lineY);
  ctx.stroke();

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${18 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 * scale;
  ctx.strokeText(dateStr.toUpperCase(), stripX + stripWidth / 2, footerY);
  ctx.fillText(dateStr.toUpperCase(), stripX + stripWidth / 2, footerY);

  // RETRO sticker
  ctx.save();
  ctx.translate(stripX + 100 * scale, footerY - 50 * scale);
  ctx.rotate(-8 * Math.PI / 180);
  ctx.fillStyle = '#4ecdc4';
  const retroWidth = 70 * scale;
  const retroHeight = 25 * scale;
  ctx.beginPath();
  ctx.moveTo(0, retroHeight / 2);
  ctx.lineTo(retroWidth, retroHeight / 2);
  ctx.lineTo(retroWidth - 8 * scale, -retroHeight / 2);
  ctx.lineTo(8 * scale, -retroHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${16 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RETRO', retroWidth / 2, 0);
  ctx.restore();

  // CLASSIC sticker
  ctx.save();
  ctx.translate(stripX + stripWidth - 100 * scale, footerY - 50 * scale);
  ctx.rotate(8 * Math.PI / 180);
  ctx.fillStyle = '#95e1d3';
  const classicWidth = 80 * scale;
  const classicHeight = 25 * scale;
  ctx.beginPath();
  ctx.moveTo(0, classicHeight / 2);
  ctx.lineTo(classicWidth, classicHeight / 2);
  ctx.lineTo(classicWidth - 8 * scale, -classicHeight / 2);
  ctx.lineTo(8 * scale, -classicHeight / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${16 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLASSIC', classicWidth / 2, 0);
  ctx.restore();
};

/**
 * Draw video corner decorations (scaled)
 */
export const drawVideoCornerDecorations = (ctx, stripX, stripY, stripWidth, totalHeight, scale) => {
  const cornerRadius = 12 * scale;
  const cornerDistance = 20 * scale;

  // Top-left
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(stripX + cornerDistance, stripY + cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(stripX + cornerDistance - cornerRadius, stripY + cornerDistance);
  ctx.lineTo(stripX + cornerDistance - cornerRadius - 8 * scale, stripY + cornerDistance);
  ctx.lineTo(stripX + cornerDistance, stripY + cornerDistance - cornerRadius - 8 * scale);
  ctx.lineTo(stripX + cornerDistance, stripY + cornerDistance - cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Top-right
  ctx.beginPath();
  ctx.arc(stripX + stripWidth - cornerDistance, stripY + cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(stripX + stripWidth - cornerDistance + cornerRadius, stripY + cornerDistance);
  ctx.lineTo(stripX + stripWidth - cornerDistance + cornerRadius + 8 * scale, stripY + cornerDistance);
  ctx.lineTo(stripX + stripWidth - cornerDistance, stripY + cornerDistance - cornerRadius - 8 * scale);
  ctx.lineTo(stripX + stripWidth - cornerDistance, stripY + cornerDistance - cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Bottom-left
  ctx.beginPath();
  ctx.arc(stripX + cornerDistance, stripY + totalHeight - cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(stripX + cornerDistance - cornerRadius, stripY + totalHeight - cornerDistance);
  ctx.lineTo(stripX + cornerDistance - cornerRadius - 8 * scale, stripY + totalHeight - cornerDistance);
  ctx.lineTo(stripX + cornerDistance, stripY + totalHeight - cornerDistance + cornerRadius + 8 * scale);
  ctx.lineTo(stripX + cornerDistance, stripY + totalHeight - cornerDistance + cornerRadius);
  ctx.closePath();
  ctx.fill();

  // Bottom-right
  ctx.beginPath();
  ctx.arc(stripX + stripWidth - cornerDistance, stripY + totalHeight - cornerDistance, cornerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(stripX + stripWidth - cornerDistance + cornerRadius, stripY + totalHeight - cornerDistance);
  ctx.lineTo(stripX + stripWidth - cornerDistance + cornerRadius + 8 * scale, stripY + totalHeight - cornerDistance);
  ctx.lineTo(stripX + stripWidth - cornerDistance, stripY + totalHeight - cornerDistance + cornerRadius + 8 * scale);
  ctx.lineTo(stripX + stripWidth - cornerDistance, stripY + totalHeight - cornerDistance + cornerRadius);
  ctx.closePath();
  ctx.fill();
};

/**
 * Draw video side pattern dots (scaled)
 */
export const drawVideoSidePatternDots = (ctx, stripX, stripY, stripWidth, totalHeight, scale) => {
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 10; i++) {
    const dotY = stripY + 60 * scale + (i * 50 * scale);
    if (dotY < stripY + totalHeight - 60 * scale) {
      ctx.beginPath();
      ctx.arc(stripX + 15 * scale, dotY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(stripX + stripWidth - 15 * scale, dotY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

/**
 * Draw video borders (scaled)
 */
export const drawVideoBorders = (ctx, stripX, stripY, stripWidth, totalHeight, scale) => {
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 12 * scale;
  ctx.strokeRect(stripX + 6 * scale, stripY + 6 * scale, stripWidth - 12 * scale, totalHeight - 12 * scale);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4 * scale;
  ctx.strokeRect(stripX + 18 * scale, stripY + 18 * scale, stripWidth - 36 * scale, totalHeight - 36 * scale);
};

