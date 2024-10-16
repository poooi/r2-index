import { execa } from 'execa'

const commitHash = await execa('git', ['rev-parse', 'HEAD'])

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
    BUILD_DATE: new Date().toISOString(),
  },
}

export default nextConfig
