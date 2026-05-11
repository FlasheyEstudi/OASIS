import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow mobile devices on the LAN to access without HMR being blocked
  allowedDevOrigins: [
    '172.16.27.213',
    '192.168.*.*',
    '10.*.*.*',
    'rlotcl-ip-165-98-19-162.tunnelmole.net',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
