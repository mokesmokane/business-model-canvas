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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: false,
        crypto: false,
        url: false,
        assert: false,
        net: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 