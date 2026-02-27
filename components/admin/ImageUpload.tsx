"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/app/actions/upload.actions";
import { extractPublicId } from "@/lib/cloudinary-utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onPublicIdChange?: (publicId: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onPublicIdChange,
  label = "Product Image",
  description = "Upload a product image (max 5MB, JPG/PNG/WebP)",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [publicId, setPublicId] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract publicId from existing image URL on mount
  useEffect(() => {
    if (value && !publicId) {
      const extractedId = extractPublicId(value);
      if (extractedId) {
        setPublicId(extractedId);
        onPublicIdChange?.(extractedId);
      }
    }
  }, [value, publicId, onPublicIdChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const result = await uploadProductImage(file);

      if (result.success && result.url) {
        toast.success("Image uploaded successfully!");
        onChange(result.url);
        if (result.publicId) {
          setPublicId(result.publicId);
          onPublicIdChange?.(result.publicId);
        }
      } else {
        toast.error(result.error || "Failed to upload image");
        setPreview(value);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      setPreview(value);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    // Delete from Cloudinary if we have a publicId
    if (publicId) {
      const result = await deleteProductImage(publicId);
      if (!result.success) {
        toast.error(result.error || "Failed to delete image");
        return;
      }
    }

    setPreview(undefined);
    setPublicId(undefined);
    onChange("");
    onPublicIdChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image removed");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">{label}</Label>
      {description && <p className="text-sm text-slate-500">{description}</p>}

      <div className="space-y-3">
        {preview ? (
          <div className="relative aspect-square max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <Image
              src={preview}
              alt="Product preview"
              fill
              className="object-cover"
              sizes="(max-width: 384px) 100vw, 384px"
            />
            <div className="absolute right-2 top-2 flex gap-2">
              <Button
                type="button"
                onClick={handleClick}
                disabled={disabled || isUploading}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <Upload className="size-4" />
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <X className="size-4" />
              </Button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="size-8 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isUploading}
            className="flex aspect-square max-w-xs items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-slate-400 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-2 p-8 text-slate-500">
              {isUploading ? (
                <>
                  <Loader2 className="size-12 animate-spin" />
                  <p className="text-sm font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="size-12" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs">JPG, PNG, or WebP</p>
                </>
              )}
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />
      </div>
    </div>
  );
}
