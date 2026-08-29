import type { NextConfig } from "next";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath,
  images: { unoptimized: true },
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
