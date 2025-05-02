import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Add this pattern to allow images from LinkedIn CDN
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
       // Allow images served locally from the public directory
       // NOTE: This might not be needed if images are served from the root
       // but added for clarity if accessing via '/uploads/...' path directly.
       // Next.js should handle '/public' automatically for local images.
       // {
       //   protocol: 'http', // Or https if using custom domain with SSL
       //   hostname: 'localhost', // Or your domain
       //   port: process.env.PORT || '3000', // Your app's port
       //   pathname: '/uploads/**',
       // },
    ],
    // Allow serving local images (from /public folder) without explicit patterns
    // This is generally handled by Next.js, but ensure no conflicts
    // remotePatterns already covers external URLs.
  },
   // Add fs-related packages and potentially the public dir if needed for server actions
   experimental: {
     serverComponentsExternalPackages: ['better-sqlite3'], // Keep existing
     // Consider adding 'fs/promises' if direct import causes issues, though usually not needed.
     // Adding '/public' might be necessary in some deployment environments if fs operations fail.
     // serverComponentsExternalPackages: ['better-sqlite3', 'fs/promises', '/public'],
   },
};

export default nextConfig;
