import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
