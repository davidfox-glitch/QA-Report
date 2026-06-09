/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  // Allow API routes to be served from the root (no special config needed)
  
  // Allow dev host IP
  allowedDevOrigins: ['192.168.18.23'],
};

export default nextConfig;
