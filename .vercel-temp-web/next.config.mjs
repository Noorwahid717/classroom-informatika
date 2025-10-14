import { createSecureHeaders } from "next-secure-headers";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = createSecureHeaders({
  forceHTTPSRedirect: [true, { maxAge: 63072000, includeSubDomains: true }],
  frameGuard: "deny",
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'", "https://js.sentry-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.r2.cloudflarestorage.com"],
      connectSrc: ["'self'", "https://*.upstash.io", process.env.NEXT_PUBLIC_API_URL || ""],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  referrerPolicy: "strict-origin-when-cross-origin",
  xssProtection: "sanitize"
});


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  compiler: {
    removeConsole: isProd ? { exclude: ["error"] } : false
  }
};

export default nextConfig;
