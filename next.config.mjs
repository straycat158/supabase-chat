/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['pslfvwsvkwwoxhlpknwp.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pslfvwsvkwwoxhlpknwp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
