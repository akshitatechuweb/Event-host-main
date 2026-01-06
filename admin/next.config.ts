/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.unrealvibe.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
