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
    ],
  },
   // Add this experimental flag to bundle 'better-sqlite3' for server components/actions
   experimental: {
     serverComponentsExternalPackages: ['better-sqlite3'],
   },
};

export default nextConfig;
