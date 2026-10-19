import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  allowedDevOrigins: ['127.0.0.1'],
  async rewrites() {
    return [
      {
        source: '/resume-analyzer',
        destination: '/analyzer',
      },
      {
        source: '/skill-verification',
        destination: '/skills',
      },
      {
        source: '/job-search',
        destination: '/jobs',
      },
    ];
  },
};

export default nextConfig;
