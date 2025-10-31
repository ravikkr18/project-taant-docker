/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig