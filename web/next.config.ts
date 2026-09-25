import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
    ],

    // Why this is gated behind NODE_ENV rather than always on: the check
    // Next.js is bypassing here exists specifically to prevent SSRF --
    // using this server's own network position to reach internal-only
    // addresses on someone else's behalf. `localhost` resolving to a
    // loopback IP is exactly the shape of a real attack payload, and the
    // only reason it is safe to allow here is that in local development
    // the "internal network" being reached is deliberately your own MinIO
    // container. In production, `localhost` from the API server's
    // perspective would mean something else entirely (a different
    // container, a cloud metadata endpoint), and the images living in a
    // real bucket never need this exception at all -- production traffic
    // hits `S3_ENDPOINT`, not localhost, so this flag has nothing to do
    // once deployed. Scoping it to development means the exception
    // physically cannot ship.
    ...(process.env.NODE_ENV === 'development'
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
}

export default nextConfig
