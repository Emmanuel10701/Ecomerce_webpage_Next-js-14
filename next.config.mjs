/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'example.com', // Replace with the actual domain of your images
      'cdn.example.com', // Another example domain
      'images.example.com', // Additional domains if needed
    ],
  },
  // You can add other Next.js configuration options here
};

export default nextConfig;
