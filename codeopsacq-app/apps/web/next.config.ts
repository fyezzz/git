import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The database package ships TypeScript source; Next compiles it with the app.
  transpilePackages: ["@codeopsacq/database"],
  poweredByHeader: false,
};

export default nextConfig;
