/**
 * Cloudinary type definitions and interfaces
 */

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
}

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: "scale" | "fit" | "limit" | "fill" | "pad" | "crop" | "thumb";
  quality?: "auto" | "best" | "good" | "eco" | "low" | number;
  fetch_format?: "auto" | "jpg" | "png" | "webp" | "avif";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  effect?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: "image" | "video" | "raw" | "auto";
  tags?: string[];
  context?: Record<string, string>;
  transformation?: CloudinaryTransformation | CloudinaryTransformation[];
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}
