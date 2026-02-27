"use server";

import cloudinary from "@/lib/cloudinary";
import type { CloudinaryUploadResult } from "@/types/cloudinary";

interface UploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  };
}

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload a product image to Cloudinary
 * @param file - The image file to upload
 * @param options - Optional configuration for the upload
 * @returns Object with success status and URL/error
 */
export async function uploadProductImage(
  file: File,
  options?: UploadOptions,
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: options?.folder || "products",
              transformation: options?.transformation || {
                width: 800,
                height: 800,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error("Upload failed: No result returned"));
            },
          )
          .end(buffer);
      },
    );

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again.",
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Object with success status
 */
export async function deleteProductImage(
  publicId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!publicId) {
      return { success: false, error: "No public ID provided" };
    }

    await cloudinary.uploader.destroy(publicId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete image. Please try again.",
    };
  }
}

/**
 * Upload multiple product images to Cloudinary
 * @param files - Array of image files to upload
 * @param options - Optional configuration for the upload
 * @returns Array of upload results
 */
export async function uploadMultipleProductImages(
  files: File[],
  options?: UploadOptions,
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map((file) =>
      uploadProductImage(file, options),
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    return files.map(() => ({
      success: false,
      error: "Failed to upload image. Please try again.",
    }));
  }
}
