import type { NextConfig } from "next";

// GitHub Pages serves a project site under /<repo>; CI passes that prefix in. Empty for a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  // /games/queen-alice/ → out/games/queen-alice/index.html, which any static host serves as-is.
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
