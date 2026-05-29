/**
 * Image Resizer service.
 *
 * Resizes uploaded images using Sharp (with Jimp fallback).
 * Returns the resized image buffer and metadata.
 */

let sharpInstance;

try {
  sharpInstance = require('sharp');
} catch {
  // Fallback to Jimp
  sharpInstance = null;
}

const jimp = require('jimp');

/**
 * Resize an image buffer.
 * @param {Buffer} input - Source image
 * @param {number} width - Target width
 * @param {number} height - Target height (0 = auto)
 * @param {string} format - Output format (jpeg, png, webp)
 * @returns {Promise<{buffer: Buffer, format: string, width: number, height: number}>}
 */
async function resize(input, width, height, format) {
  format = format || 'jpeg';
  const w = Math.min(Math.max(parseInt(width) || 0, 1), 4000);
  const h = Math.min(Math.max(parseInt(height) || 0, 0), 4000);

  if (sharpInstance) {
    let pipeline = sharpInstance(input).resize(w, h || undefined, { fit: 'inside', withoutEnlargement: false });
    if (format === 'jpeg') pipeline = pipeline.jpeg({ quality: 85 });
    else if (format === 'png') pipeline = pipeline.png();
    else if (format === 'webp') pipeline = pipeline.webp({ quality: 85 });

    const buffer = await pipeline.toBuffer();
    const meta = await sharpInstance(input).metadata();
    return { buffer, format, width: w, height: h > 0 ? h : Math.round((h || meta.height) * (w / (meta.width || w))) };
  }

  // Jimp fallback
  const image = await jimp.read(input);
  image.resize(w, h || jimp.AUTO);
  const mimeType = 'image/' + (format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpeg');
  const buffer = await image.getBufferAsync(mimeType);
  return { buffer, format, width: image.bitmap.width, height: image.bitmap.height };
}

module.exports = { resize };
