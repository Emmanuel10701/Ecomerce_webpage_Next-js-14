/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'example.com', // Replace with the actual domain of your images
      'cdn.example.com',
      'images.example.com',
      "images.pexels.com", 
      'cdn.jsdelivr.net',
      'via.placeholder.com',
    ],
  },
  // You can add other Next.js configuration options here
};

export default nextConfig;
