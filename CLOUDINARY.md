# Cloudinary Integration Documentation

This project uses Cloudinary for image upload, storage, and optimization. This document explains the implementation and how to use it.

## Setup

### 1. Install Dependencies

The Cloudinary package has already been installed:

```bash
pnpm add cloudinary
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

You can find these credentials in your [Cloudinary Dashboard](https://cloudinary.com/console).

## Project Structure

### Files Created/Modified

1. **`lib/cloudinary.ts`** - Main Cloudinary configuration and utility functions
2. **`app/actions/upload.actions.ts`** - Server actions for uploading and deleting images
3. **`components/admin/ImageUpload.tsx`** - Reusable image upload component
4. **`types/cloudinary.ts`** - TypeScript type definitions for Cloudinary
5. **`components/admin/EditProductForm.tsx`** - Updated to use ImageUpload component
6. **`app/admin/products/new/page.tsx`** - Updated to use ImageUpload component

## Features

### 1. Image Upload

- Drag-and-drop or click to upload
- File type validation (JPG, PNG, WebP)
- File size validation (max 5MB)
- Automatic image optimization
- Real-time preview
- Loading states

### 2. Image Optimization

Uploaded images are automatically optimized with:

- Width/height limits (800x800 by default)
- Automatic quality adjustment
- Format conversion (WebP for modern browsers)
- Responsive image URLs for different screen sizes

### 3. Image Deletion

- Images can be deleted from Cloudinary when removed
- Automatic cleanup of old images
- Public ID extraction from URLs

## Usage

### Basic Image Upload Component

```tsx
import ImageUpload from "@/components/admin/ImageUpload";

function MyForm() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <ImageUpload
      value={imageUrl}
      onChange={(url) => setImageUrl(url)}
      label="Product Image"
      description="Upload a product image (max 5MB)"
      disabled={false}
    />
  );
}
```

### Upload with Custom Options

```typescript
import { uploadProductImage } from "@/app/actions/upload.actions";

const result = await uploadProductImage(file, {
  folder: "products/featured",
  transformation: {
    width: 1200,
    height: 1200,
    crop: "fill",
    quality: "best",
  },
});

if (result.success) {
  console.log("Image URL:", result.url);
  console.log("Public ID:", result.publicId);
} else {
  console.error("Upload failed:", result.error);
}
```

### Multiple Image Upload

```typescript
import { uploadMultipleProductImages } from "@/app/actions/upload.actions";

const files = [file1, file2, file3];
const results = await uploadMultipleProductImages(files, {
  folder: "products/gallery",
});

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Image ${index + 1} uploaded:`, result.url);
  } else {
    console.error(`Image ${index + 1} failed:`, result.error);
  }
});
```

### Delete Image

```typescript
import { deleteProductImage } from "@/app/actions/upload.actions";

const result = await deleteProductImage(publicId);

if (result.success) {
  console.log("Image deleted successfully");
} else {
  console.error("Delete failed:", result.error);
}
```

### Utility Functions

#### Get Optimized URL

```typescript
import { getCloudinaryUrl } from "@/lib/cloudinary";

const url = getCloudinaryUrl(publicId, {
  width: 400,
  height: 400,
  crop: "fill",
  quality: "auto",
});
```

#### Get Thumbnail

```typescript
import { getThumbnailUrl } from "@/lib/cloudinary";

const thumbnailUrl = getThumbnailUrl(publicId);
// Returns: 200x200 optimized thumbnail
```

#### Get Responsive URLs

```typescript
import { getResponsiveUrls } from "@/lib/cloudinary";

const urls = getResponsiveUrls(publicId);
console.log(urls.small); // 400x400
console.log(urls.medium); // 800x800
console.log(urls.large); // 1200x1200
console.log(urls.original); // 2000x2000
```

#### Extract Public ID from URL

```typescript
import { extractPublicId } from "@/lib/cloudinary";

const publicId = extractPublicId(
  "https://res.cloudinary.com/demo/image/upload/v1234/products/image.jpg",
);
// Returns: "products/image"
```

## API Reference

### Server Actions

#### `uploadProductImage(file, options?)`

Uploads a single image to Cloudinary.

**Parameters:**

- `file: File` - The image file to upload
- `options?: UploadOptions` - Optional configuration
  - `folder?: string` - Cloudinary folder (default: "products")
  - `transformation?: object` - Image transformation options

**Returns:** `Promise<UploadResult>`

- `success: boolean` - Upload success status
- `url?: string` - Cloudinary URL of uploaded image
- `publicId?: string` - Public ID for the image
- `error?: string` - Error message if failed

#### `deleteProductImage(publicId)`

Deletes an image from Cloudinary.

**Parameters:**

- `publicId: string` - The public ID of the image to delete

**Returns:** `Promise<DeleteResult>`

- `success: boolean` - Deletion success status
- `error?: string` - Error message if failed

#### `uploadMultipleProductImages(files, options?)`

Uploads multiple images to Cloudinary.

**Parameters:**

- `files: File[]` - Array of image files to upload
- `options?: UploadOptions` - Optional configuration

**Returns:** `Promise<UploadResult[]>`

## Best Practices

1. **Always validate file size and type** - The upload action includes built-in validation, but you can add UI-level validation for better UX.

2. **Use appropriate image sizes** - Don't upload unnecessarily large images. The default 800x800 limit works well for most product images.

3. **Clean up old images** - When replacing an image, delete the old one from Cloudinary to avoid storage bloat.

4. **Use transformations wisely** - Cloudinary transformations are powerful but should be used thoughtfully to avoid excessive processing.

5. **Store public IDs** - Store the public ID in your database alongside the URL so you can delete images later.

6. **Use responsive images** - Use the `getResponsiveUrls` utility to serve appropriate image sizes for different devices.

7. **Handle errors gracefully** - Always check the `success` status of upload/delete operations and show appropriate error messages to users.

## Folder Structure

Images are organized in Cloudinary as follows:

- `products/` - Product images
- `products/featured/` - Featured product images (if customized)
- `products/gallery/` - Product gallery images (if using multiple images)

You can customize the folder structure by passing the `folder` option to upload functions.

## Security

- API keys are stored securely in environment variables
- Upload validation is performed server-side
- File type and size restrictions are enforced
- Only authenticated admin users can upload/delete images (ensure proper authentication in your admin routes)

## Troubleshooting

### Upload fails with "Invalid file type"

- Ensure the file is JPG, PNG, or WebP
- Check the file extension matches the actual file type

### Upload fails with "File size too large"

- Maximum file size is 5MB
- Resize or compress images before uploading

### Image not displaying

- Check the Cloudinary URL is correctly formed
- Verify your Cloudinary cloud name matches your account
- Ensure the image was successfully uploaded (check Cloudinary dashboard)

### Cannot delete image

- Ensure the public ID is correct
- Check that the image exists in Cloudinary
- Verify your API credentials have delete permissions

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
