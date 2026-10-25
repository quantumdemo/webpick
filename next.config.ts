import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright-core', '@sparticuz/chromium'],
  turbopack: {},
  webpack: (config) => {
    config.externals.push({
      'playwright-core': 'commonjs playwright-core',
      '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
    });
    return config;
  },
};

export default nextConfig;
