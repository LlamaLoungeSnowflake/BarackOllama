import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/copilotkit',
        destination:
          process.env.COPILOTKIT_BACKEND_URL || 'http://localhost:8000/copilotkit',
      },
    ]
  },
}

export default nextConfig
