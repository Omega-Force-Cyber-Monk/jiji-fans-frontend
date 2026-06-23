import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,

  // compiler: {
  //   removeConsole: process.env.NODE_ENV === "production",
  // },
  // experimental: {
  //   devIndicator: false,
  // },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus2fans.com",
      },
      {
        protocol: "https",
        hostname: "**.plus2fans.com",
      },
      {
        protocol: "https",
        hostname: "twofans-private.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.plus2fans.com",
      },
      {
        protocol: "https",
        hostname: "merinasib.shop",
      },
      {
        protocol: "https",
        hostname: "**.merinasib.shop",
      },
      {
        protocol: "https",
        hostname: "abu-bakar3000.merinasib.shop",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "jiji-content-creation-application.onrender.com",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // custom redirect for specific route
  async rewrites() {
    return [
      {
        source: "/mychannel/videos/:slug", // Dynamic slug
        destination: "/overview/videos/:slug", // Redirect to the overview page with the same slug
      },
    ];
  },
};

export default nextConfig;
