import { enhanceRouteHandler } from '@kit/next/routes';
import { isValidImage, optimizeImage } from '@kit/shared/image-optimization';

/**
 * @name GET
 * @description GET handler for image optimization
 * Accepts query parameters: url, w (width), h (height), q (quality), f (format)
 */
export const GET = enhanceRouteHandler(
  async ({ request }) => {
    try {
      const { searchParams } = new URL(request.url);

      const imageUrl = searchParams.get('url');
      const width = searchParams.get('w');
      const height = searchParams.get('h');
      const quality = searchParams.get('q');
      const format = searchParams.get('f');

      // Validate required parameters
      if (!imageUrl) {
        return new Response('Missing image URL', { status: 400 });
      }

      // Validate format
      const validFormats = ['webp', 'avif', 'jpeg', 'png'];
      if (format && !validFormats.includes(format)) {
        return new Response(
          'Invalid format. Must be one of: webp, avif, jpeg, png',
          {
            status: 400,
          },
        );
      }

      // Fetch the original image
      const imageResponse = await fetch(imageUrl);

      if (!imageResponse.ok) {
        return new Response('Failed to fetch image', { status: 404 });
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Optimize the image
      const optimizedBuffer = await optimizeImage(buffer, {
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        quality: quality ? parseInt(quality, 10) : 80,
        format: (format as 'webp' | 'avif' | 'jpeg' | 'png') || 'webp',
      });

      // Determine content type based on format
      const contentType =
        format === 'avif'
          ? 'image/avif'
          : format === 'jpeg'
            ? 'image/jpeg'
            : format === 'png'
              ? 'image/png'
              : 'image/webp';

      // Return optimized image with caching headers
      return new Response(optimizedBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      console.error('Image optimization error:', error);
      return new Response('Failed to optimize image', { status: 500 });
    }
  },
  {
    auth: false, // Allow public access for image optimization
  },
);

/**
 * @name POST
 * @description POST handler for direct image upload optimization
 * Accepts multipart/form-data with image file and optional parameters
 */
export const POST = enhanceRouteHandler(
  async ({ request }) => {
    try {
      const formData = await request.formData();

      const imageFile = formData.get('image') as File | null;
      const width = formData.get('width') as string | null;
      const height = formData.get('height') as string | null;
      const quality = formData.get('quality') as string | null;
      const format = formData.get('format') as string | null;

      // Validate required parameters
      if (!imageFile) {
        return new Response('Missing image file', { status: 400 });
      }

      // Validate format
      const validFormats = ['webp', 'avif', 'jpeg', 'png'];
      if (format && !validFormats.includes(format)) {
        return new Response(
          'Invalid format. Must be one of: webp, avif, jpeg, png',
          {
            status: 400,
          },
        );
      }

      // Convert file to buffer
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate image
      const isValid = await isValidImage(buffer);
      if (!isValid) {
        return new Response('Invalid image file', { status: 400 });
      }

      // Optimize the image
      const optimizedBuffer = await optimizeImage(buffer, {
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        quality: quality ? parseInt(quality, 10) : 80,
        format: (format as 'webp' | 'avif' | 'jpeg' | 'png') || 'webp',
      });

      // Determine content type based on format
      const contentType =
        format === 'avif'
          ? 'image/avif'
          : format === 'jpeg'
            ? 'image/jpeg'
            : format === 'png'
              ? 'image/png'
              : 'image/webp';

      // Return optimized image
      return new Response(optimizedBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="optimized.${format || 'webp'}"`,
        },
      });
    } catch (error) {
      console.error('Image optimization error:', error);
      return new Response('Failed to optimize image', { status: 500 });
    }
  },
  {
    auth: true, // Require authentication for direct uploads
  },
);
