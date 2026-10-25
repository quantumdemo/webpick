import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  turbopack: {},
  webpack: (config) => {
    config.externals.push({
      '@sparticuz/chromium': 'commonjs @sparticuz/chromium',
      'puppeteer-core': 'commonjs puppeteer-core',
    });
    return config;
  },
};

export default nextConfig;
