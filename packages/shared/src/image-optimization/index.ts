import 'server-only';

import sharp from 'sharp';

/**
 * Options for image optimization
 */
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

/**
 * Optimizes an image buffer using Sharp
 *
 * @param buffer - The image buffer to optimize
 * @param options - Optimization options
 * @returns Optimized image buffer
 */
export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {},
): Promise<Buffer> {
  const { width, height, quality = 80, format = 'webp' } = options;

  let pipeline = sharp(buffer);

  // Resize if dimensions are provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Apply format-specific optimizations
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, progressive: true });
      break;
  }

  return pipeline.toBuffer();
}

/**
 * Generates an optimized image URL with query parameters
 *
 * @param originalUrl - The original image URL
 * @param options - Optimization options
 * @returns URL with optimization parameters
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions,
): string {
  const params = new URLSearchParams();

  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  return `/api/images/optimize?url=${encodeURIComponent(originalUrl)}&${params.toString()}`;
}

/**
 * Gets image metadata without loading the full image
 *
 * @param buffer - The image buffer
 * @returns Image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size,
  };
}

/**
 * Validates if a buffer is a valid image
 *
 * @param buffer - The buffer to validate
 * @returns True if valid image, false otherwise
 */
export async function isValidImage(buffer: Buffer): Promise<boolean> {
  try {
    await sharp(buffer).metadata();
    return true;
  } catch {
    return false;
  }
}
