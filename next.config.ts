import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'export',
  basePath: '/sacco-wallet',
  assetPrefix: '/sacco-wallet/',
}

export default nextConfig
