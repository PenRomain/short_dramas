import type { NextConfig } from "next";

const CDN = process.env.NEXT_PUBLIC_DEV_R2_ENDPOINT;

if (!CDN) {
  throw new Error("NEXT_PUBLIC_R2_ENDPOINT is not defined");
}

const nextConfig: NextConfig = {
  crossOrigin: "anonymous",
  poweredByHeader: false,
  webpack(config) {
    config.stats = {
      all: false,
      errors: true,
      warnings: true,
      colors: true,
      errorDetails: true,
      moduleTrace: true,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/ivhid_src/:file*",
        destination: `${CDN}/ivhid_src/:file*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Accept",
            value: "application/json",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/ivhid_src/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Accept", value: "application/json" },
        ],
      },
    ];
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "*.ngrok-free.app",
    "https://pub-*.r2.dev",
    "https://ud824.com",
  ],
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.ngrok-free.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dj-girl.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: new URL(CDN).hostname,
        port: "",
        pathname: "/ivhid_src/**",
      },
      // new URL("https://drive.google.com/**"),
      new URL("https://www.googleapis.com/**"),
    ],
  },
};

export default nextConfig;
