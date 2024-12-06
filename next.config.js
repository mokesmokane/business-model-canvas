/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/document-process/:path*',
        destination: 'https://process-uploaded-document-dnygg3h7rq-uc.a.run.app/:path*'
      }
    ]
  },
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig 