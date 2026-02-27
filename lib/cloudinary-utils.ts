/**
 * Client-safe Cloudinary utility functions
 * These functions don't import the Cloudinary SDK and can be used in client components
 */

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function extractPublicId(url: string): string | null {
  if (!url) return null;

  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return null;

    // Get everything after /upload/ and before the file extension
    const afterUpload = urlParts.slice(uploadIndex + 1);

    // Cloudinary transformation parameter prefixes (based on official documentation)
    // See: https://cloudinary.com/documentation/transformation_reference
    const transformPrefixes = [
      "w_",
      "h_",
      "c_",
      "ar_",
      "g_",
      "x_",
      "y_",
      "r_",
      "e_",
      "l_",
      "t_",
      "q_",
      "f_",
      "dpr_",
      "fl_",
      "bo_",
      "co_",
      "o_",
      "b_",
      "a_",
      "dn_",
      "pg_",
      "dl_",
      "vs_",
      "so_",
      "eo_",
      "du_",
      "z_",
      "d_",
      "if_",
      "ac_",
      "af_",
      "br_",
      "cs_",
      "ki_",
      "vc_",
      "fps_",
      "sp_",
      "u_",
    ];

    // Remove version and transformation segments
    const withoutVersion = afterUpload.filter((part) => {
      // Skip version parts (e.g., v1234567890)
      const isVersion =
        part.startsWith("v") && !isNaN(Number(part.substring(1)));

      // Skip transformation parts: check if part starts with known transformation prefixes
      // or contains multiple comma-separated transformation parameters
      const isTransformation =
        transformPrefixes.some((prefix) => part.startsWith(prefix)) ||
        // Check if it's a compound transformation (e.g., "w_200,h_300,c_fill")
        (part.includes(",") &&
          transformPrefixes.some((prefix) =>
            part
              .split(",")
              .some((segment) => segment.trim().startsWith(prefix)),
          ));

      return !isVersion && !isTransformation;
    });

    // Join and remove file extension
    const publicIdWithExt = withoutVersion.join("/");
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

/**
 * Build a Cloudinary URL with transformations (client-side version)
 * Note: This is a simplified version. For server-side, use cloudinary.url()
 * @param cloudName - Your Cloudinary cloud name
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 * @returns Cloudinary URL
 */
export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  },
): string {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  const transformations: string[] = [];

  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.format) transformations.push(`f_${options.format}`);

  const transformationString =
    transformations.length > 0 ? transformations.join(",") + "/" : "";

  return `${baseUrl}/${transformationString}${publicId}`;
}
