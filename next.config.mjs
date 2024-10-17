import { execa } from 'execa'

const commitHash = await execa('git', ['rev-parse', 'HEAD'])
const now = new Date().toISOString()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  env: {
    COMMIT_HASH: commitHash.stdout,
    BUILD_DATE: now,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Poi-Codename',
          value: 'Asashio',
        },
        {
          key: 'X-Poi-Revision',
          value: commitHash.stdout ?? 'development',
        },
        {
          key: 'X-Poi-Build-Date',
          value: now,
        },
        {
          key: 'X-Poi-Greetings',
          value: 'poi?',
        },
      ],
    },
  ],
}

export default nextConfig
