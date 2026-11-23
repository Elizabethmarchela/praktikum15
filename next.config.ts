import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/tasks": ["./dev.db"],
    "/api/tasks/[id]": ["./dev.db"],
  },
};

export default nextConfig;
