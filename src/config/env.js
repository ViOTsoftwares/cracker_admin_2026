export const ENV = {
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "local",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/admin",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "localhost",
  IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000/image",
};
