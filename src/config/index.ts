const config = {
  apiUrl: process.env.NEXT_PUBLIC_SERVER_URL as string,
  imageUrl: (process.env.NEXT_PUBLIC_IMAGE_URL || "https://api.plus2fans.com") as string,
  jwtSecret: process.env.JWT_SECRET_KEY as string,
  isProduction: process.env.NEXT_PUBLIC_MODE === 'production' ? true : false,
  tinymceApiKey: process.env.NEXT_PUBLIC_TINYMCE_API_KEY as string,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL as string,
  // apiKey: process.env.API_KEY,
};

export const { apiUrl, imageUrl, jwtSecret, isProduction, tinymceApiKey, socketUrl } = config;
