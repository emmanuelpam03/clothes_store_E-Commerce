import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Re-export client-safe utilities
export { extractPublicId } from "./cloudinary-utils";

/**
 * Get a Cloudinary URL with transformations
 * @param publicId - The public ID of the image
 * @param width - Width of the image
 * @param height - Height of the image
 * @param crop - Crop mode (fill, fit, limit, etc.)
 * @param quality - Quality (auto, best, good, etc.)
 * @returns Transformed image URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  },
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width || 800,
        height: options?.height || 800,
        crop: options?.crop || "limit",
        quality: options?.quality || "auto",
        fetch_format: options?.format || "auto",
      },
    ],
    secure: true,
  });
}

/**
 * Get optimized thumbnail URL
 * @param publicId - The public ID of the image
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 200,
    height: 200,
    crop: "fill",
    quality: "auto",
  });
}

/**
 * Get responsive image URLs for different screen sizes
 * @param publicId - The public ID of the image
 * @returns Object with URLs for different sizes
 */
export function getResponsiveUrls(publicId: string): {
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    small: getCloudinaryUrl(publicId, { width: 400, height: 400 }),
    medium: getCloudinaryUrl(publicId, { width: 800, height: 800 }),
    large: getCloudinaryUrl(publicId, { width: 1200, height: 1200 }),
    original: getCloudinaryUrl(publicId, { width: 2000, height: 2000 }),
  };
}
