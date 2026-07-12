import { ENV } from "@/config/env";

export const getImageUrl = (imagePath?: string, folder?: string, fallback: string = "/default-avatar.svg") => {
  if (!imagePath) return fallback;

  // Handle case where backend returned "undefined/profiles/..." due to missing IMAGE_URL env var on backend
  if (imagePath.startsWith("undefined/")) {
    return `${ENV.IMAGE_URL}/${imagePath.substring(10)}`;
  }

  // Handle blob preview URLs
  if (imagePath.startsWith("blob:") || imagePath.startsWith("data:")) {
    return imagePath;
  }

  // If it's already a full URL:
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // If it points to localhost but the app is running in production/demo, swap the domain dynamically
    if (imagePath.includes("localhost:5000/image")) {
      return imagePath.replace("http://localhost:5000/image", ENV.IMAGE_URL);
    }
    return imagePath;
  }

  // If it's a relative path starting with /image
  if (imagePath.startsWith("/image/")) {
    return `${ENV.IMAGE_URL}${imagePath.substring(6)}`;
  }

  // If it starts with /
  if (imagePath.startsWith("/")) {
    return `${ENV.IMAGE_URL}${imagePath}`;
  }

  if (folder) {
    return `${ENV.IMAGE_URL}/${folder}/${imagePath}`;
  }

  return `${ENV.IMAGE_URL}/${imagePath}`;
};
