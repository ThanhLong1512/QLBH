import type { NextConfig } from "next";

/**
 * PetroLub CRM/DMS - Next.js Configuration
 *
 * PWA Setup with Serwist (@serwist/next):
 * ============================================================================
 * Serwist is the modern, actively maintained successor to next-pwa.
 * To enable full offline service worker caching in production:
 *
 * 1. Install Serwist:
 *    `npm install @serwist/next @serwist/precaching @serwist/sw`
 * 
 * 2. Create `src/app/sw.ts`:
 *    ```ts
 *    import { defaultCache } from "@serwist/next/worker";
 *    import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
 *    import { Serwist } from "serwist";
 *
 *    declare global {
 *      interface WorkerGlobalScope extends SerwistGlobalConfig {
 *        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
 *      }
 *    }
 *    declare const self: ServiceWorkerGlobalScope;
 *
 *    const serwist = new Serwist({
 *      precacheEntries: self.__SW_MANIFEST,
 *      skipWaiting: true,
 *      clientsClaim: true,
 *      navigationPreload: true,
 *      runtimeCaching: defaultCache,
 *    });
 *    serwist.addEventListeners();
 *    ```
 *
 * 3. Wrap nextConfig with `withSerwistInit({ swSrc: "src/app/sw.ts", swDest: "public/sw.js" })`.
 * ============================================================================
 */

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Ensure transpilePackages if any ESM packages need Next.js bundle resolution
  transpilePackages: ["lucide-react"],
  // Optimize package imports
  experimental: {
    optimizePackageImports: ["lucide-react", "leaflet"],
  },
};

export default nextConfig;
