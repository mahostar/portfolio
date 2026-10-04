import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false, devIndicators: false, images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/projects/cleenolve", destination: "/projects/cleanoov", permanent: true },
      { source: "/projects/cleenolve/opengraph-image", destination: "/projects/cleanoov/opengraph-image", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, { key: "X-Frame-Options", value: "DENY" }] },
      // These filenames can change, so use a bounded cache rather than immutable.
      ...["images", "logos", "videos"].map((directory) => ({
        source: `/${directory}/:path*`,
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      })),
    ];
  },
};
export default nextConfig;
