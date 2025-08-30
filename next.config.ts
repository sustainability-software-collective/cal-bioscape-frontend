import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add rewrites to proxy API requests to the backend service in development
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Match any path starting with /api/
        // Destination uses the backend service name from docker-compose.yml
        // Assumes backend runs on port 8000 inside the Docker network
        // Explicitly add trailing slash before :path*
        destination: 'http://backend:8000/api/:path*/',
      },
    ];
  },
  /* other config options can go here */
};

export default nextConfig;
