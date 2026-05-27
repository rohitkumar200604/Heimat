import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent heavy server-only packages from being bundled during dev.
  serverExternalPackages: [
    "@supabase/supabase-js",
  ],

  // Explicitly set the build output directory so Next.js always resolves
  // correctly when npm is run from a parent directory.
  distDir: ".next",

  turbopack: {
    // Pin the workspace root to this app's directory.
    // Silences the "multiple lockfiles detected" warning caused by a
    // package-lock.json also existing in the parent D:\GitHub\Personal\Heimant\ folder.
    root: path.resolve(__dirname),
  },

  experimental: {
    // Tree-shake icon libraries so only used icons are imported
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
