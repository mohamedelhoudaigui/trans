import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // standalone output mode. CRITICAL for lean Docker images.
  // It creates a '.next/standalone' folder with a self-contained server.js
  // and copies only the necessary node_modules.
  output: 'standalone',

  // Add any other Next.js configurations here.
};

export default nextConfig;
