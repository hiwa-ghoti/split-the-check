import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Parent folder has another lockfile; keep this app as the workspace root.
    root: path.join(__dirname),
  },
};

export default nextConfig;
