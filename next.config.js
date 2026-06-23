import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  // Allow API routes to be served from the root (no special config needed)
  
  // Allow dev host IP
  allowedDevOrigins: ['192.168.18.23'],
  env: {
    NEXT_PUBLIC_AIPARTNER_API_KEY: process.env.AIpartner || process.env.NEXT_PUBLIC_AIPARTNER_API_KEY || process.env.GEMINI_API_KEY,
  },
};

export default withPWA(nextConfig);
