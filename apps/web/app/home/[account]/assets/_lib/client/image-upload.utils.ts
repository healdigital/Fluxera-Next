'use client';

/**
 * Client-side utilities for image upload and optimization
 */

export interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimizes an image file before upload by sending it to the optimization API
 *
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Optimized image as a Blob
 */
export async function optimizeImageForUpload(
  file: File,
  options: ImageUploadOptions = {},
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp',
  } = options;

  // Create form data
  const formData = new FormData();
  formData.append('image', file);
  formData.append('width', maxWidth.toString());
  formData.append('height', maxHeight.toString());
  formData.append('quality', quality.toString());
  formData.append('format', format);

  // Send to optimization API
  const response = await fetch('/api/images/optimize', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to optimize image');
  }

  return response.blob();
}

/**
 * Validates if a file is an image
 *
 * @param file - The file to validate
 * @returns True if the file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Gets the file size in a human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Creates a preview URL for an image file
 *
 * @param file - The image file
 * @returns Object URL for preview
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes an object URL to free memory
 *
 * @param url - The object URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
