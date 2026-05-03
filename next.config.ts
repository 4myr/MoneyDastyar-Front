import type { NextConfig } from "next";

const isExport = process.env.BUILD_OUTPUT === 'export';

const nextConfig: NextConfig = {
  output: isExport ? 'export' : 'standalone',
  basePath: process.env.BASE_PATH ?? '',
  trailingSlash: isExport,
};

export default nextConfig;
