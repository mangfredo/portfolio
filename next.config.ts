import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the root: this folder sits inside another directory, and Turbopack
  // otherwise picks the parent as root and watches everything in it.
  turbopack: { root: __dirname },
};

export default nextConfig;
