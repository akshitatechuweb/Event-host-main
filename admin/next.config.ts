/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://event-host-main-1.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
