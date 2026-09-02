import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@snipgraph/content-domain", "@snipgraph/reference-kit"],
};

export default nextConfig;
