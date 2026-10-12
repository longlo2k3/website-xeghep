import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, PATCH, DELETE, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, Idempotency-Key, x-revalidate-secret, X-Requested-With, Accept",
          },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/airport-pricing/:path*",
        destination: "/api/airport_pricing/:path*",
      },
      {
        source: "/api/airport-pricing",
        destination: "/api/airport_pricing",
      },
      {
        source: "/api/distance-rates/:path*",
        destination: "/api/distance_rates/:path*",
      },
      {
        source: "/api/distance-rates",
        destination: "/api/distance_rates",
      },
      {
        source: "/api/globals/company-settings",
        destination: "/api/globals/company_settings",
      },
      {
        source: "/api/globals/pricing-settings",
        destination: "/api/globals/pricing_settings",
      },
    ];
  },
};

export default withPayload(nextConfig);
