import type { NextConfig } from "next";

// Solo se optimizan imágenes del bucket público de Supabase; el resto se sirve sin optimizar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns = supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: { remotePatterns },
  // Sin el indicador de desarrollo: el prototipo se presenta a clientes desde el entorno local
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
